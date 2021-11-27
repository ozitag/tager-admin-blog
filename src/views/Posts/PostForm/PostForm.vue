<template>
  <page
    :title="isCreation ? $t('blog:createPost') : $t('blog:updatePost')"
    :is-content-loading="isContentLoading"
    :header-buttons="headerButtonList"
    :footer="{
      backHref: postListUrl,
      onSubmit: submitForm,
      isSubmitting: isSubmitting,
    }"
  >
    <template v-slot:content>
      <form novalidate @submit.prevent="submitForm">
        <tab-list
          :tab-list="tabList"
          :selected-tab-id="selectedTabId"
          @tab:update="selectedTabId = $event.tabId"
        />

        <template v-if="selectedTabId === 'common'">
          <form-field-select
            v-model="values.status"
            name="status"
            :error="errors.status"
            :label="$t('blog:status')"
            :no-options-message="$t('blog:noTemplates')"
            :options="statusOptions"
          />

          <form-field-select
            v-if="isCreation && isLangSpecific"
            v-model="values.language"
            name="language"
            :label="$t('blog:language')"
            :options="languageOptionList"
            :error="errors.language"
          />

          <form-field
            v-model="values.title"
            name="title"
            :label="$t('blog:title')"
            :error="errors.title"
            @input="handleTitleChange"
          />

          <form-field-url-alias-input
            id="urlAlias"
            v-model="values.urlAlias"
            name="urlAlias"
            :label="$t('blog:link')"
            :url-template="urlAliasTemplate"
            :error="errors.urlAlias"
            @change="handleAliasChange"
          />

          <form-field
            v-model="values.excerpt"
            name="excerpt"
            :label="$t('blog:excerpt')"
            type="textarea"
            :error="errors.excerpt"
          />

          <form-field-rich-text-input
            v-model="values.body"
            name="body"
            :label="$t('blog:body')"
            :error="errors.body"
            :get-upload-adapter-options="getUploadAdapterOptions"
          />

          <ShortCodeConstructor
            :short-code-config-list="
              moduleConfig ? moduleConfig.shortcodes : []
            "
          />

          <form-field
            v-model="values.datetime"
            name="datetime"
            :label="$t('blog:date')"
            type="date"
            :error="errors.datetime"
          />
        </template>

        <template v-if="selectedTabId === 'images'">
          <form-field-file-input
            v-model="values.coverImage"
            :label="$t('blog:coverImage')"
            name="coverImage"
            file-type="image"
            :scenario="moduleConfig ? moduleConfig.fileScenarios.cover : null"
          />

          <form-field-file-input
            v-model="values.image"
            name="image"
            :label="$t('blog:innerImage')"
            file-type="image"
            :scenario="moduleConfig ? moduleConfig.fileScenarios.image : null"
          />

          <form-field-file-input
            v-model="values.imageMobile"
            name="imageMobile"
            :label="$t('blog:innerImageMobile')"
            file-type="image"
            :scenario="
              moduleConfig ? moduleConfig.fileScenarios.imageMobile : null
            "
          />
        </template>

        <template v-if="selectedTabId === 'relations'">
          <form-field
            v-model="values.tags"
            name="tags"
            :label="$t('blog:tags')"
            :error="errors.tags"
          />

          <form-field-multi-select
            :selected-options="values.categories"
            name="categories"
            :label="$t('blog:categories')"
            :options="categoryOptionList"
            :error="errors.categories"
            @change="handleCategoriesChange"
          />

          <form-field-multi-select
            v-model="values.relatedPosts"
            name="relatedPosts"
            :label="$t('blog:relatedPosts')"
            :options="postOptionList"
            :error="errors.relatedPosts"
            :searchable="true"
          />
        </template>

        <template v-if="selectedTabId === 'additional'">
          <DynamicField
            v-for="field of values.additionalFields"
            :key="field.name"
            :field="field"
          />
        </template>

        <template v-if="selectedTabId === 'seo'">
          <seo-field-group
            :title="values.pageTitle"
            :title-error-message="errors.pageTitle"
            :title-label="$t('blog:pageTitle')"
            :description="values.pageDescription"
            :description-error-message="errors.pageDescription"
            :description-label="$t('blog:pageDescription')"
            :image="values.openGraphImage"
            :image-error-message="errors.openGraphImage"
            :image-label="$t('blog:openGraphImage')"
            :image-scenario="
              moduleConfig ? moduleConfig.fileScenarios.openGraph : null
            "
            @change="handleSeoFieldGroupChange"
          />
        </template>
      </form>
    </template>

    <template v-slot:footer>
      <FormFooter
        :back-href="postListUrl"
        :on-submit="submitForm"
        :is-submitting="isSubmitting"
        :is-creation="isCreation"
        :can-create-another="isCreation"
      />
    </template>
  </page>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onMounted,
  ref,
  watch,
} from '@vue/composition-api';

import {
  convertRequestErrorToMap,
  isNotNullish,
  Nullable,
  useResource,
  urlTranslit,
} from '@tager/admin-services';
import {
  createTabErrorFinder,
  OptionType,
  TabType,
  ShortCodeConstructor,
  SeoChangeEvent,
  FormFooter,
  TagerFormSubmitEvent,
} from '@tager/admin-ui';
import { DynamicField } from '@tager/admin-dynamic-field';

import {
  getBlogPostFormUrl,
  getBlogPostListUrl,
} from '../../../constants/paths';
import {
  createBlogPost,
  getPost,
  updateBlogPost,
} from '../../../services/requests';
import { Language, PostFull } from '../../../typings/model';
import {
  useFetchModuleConfig,
  useFetchCategories,
  useFetchPosts,
} from '../../../hooks';

import {
  convertCategoryListToOptions,
  convertFormValuesToCreationPayload,
  convertFormValuesToUpdatePayload,
  convertPostToFormValues,
  FormValues,
  getStatusOptions,
} from './PostForm.helpers';

export default defineComponent({
  name: 'BlogPostForm',
  components: { DynamicField, ShortCodeConstructor, FormFooter },
  setup(props, context) {
    const postId = computed<string>(() => context.root.$route.params.postId);
    const isCreation = computed<boolean>(() => postId.value === 'create');

    const urlAliasChanged = ref<boolean>(false);

    const statusOptions = computed<OptionType[]>(() =>
      getStatusOptions(context.root.$t)
    );

    /** Fetch module config **/

    const {
      data: moduleConfig,
      loading: isModuleConfigLoading,
    } = useFetchModuleConfig({ context });

    const languageList = computed<Language[]>(
      () => moduleConfig.value?.languages ?? []
    );

    const languageOptionList = computed<OptionType[]>(() =>
      languageList.value.map(({ id, name }) => ({
        value: id,
        label: name,
      }))
    );

    const isLangSpecific = computed(() => languageOptionList.value.length > 0);

    /** Fetch category list */

    const {
      data: categoryList,
      loading: isCategoryListLoading,
    } = useFetchCategories({ context });

    /** Fetch Post */

    const [fetchPost, { data: post, loading: isPostLoading }] = useResource<
      Nullable<PostFull>
    >({
      fetchResource: () => getPost(postId.value),
      initialValue: null,
      context,
      resourceName: 'Post',
    });

    onMounted(() => {
      if (isCreation.value) return;

      fetchPost();
    });

    watch(postId, () => {
      if (isCreation.value) return;

      fetchPost();
    });

    /** Fetch post list */
    const { data: postList, loading: isPostListLoading } = useFetchPosts({
      context,
    });

    const postOptionList = computed<OptionType<number>[]>(() =>
      postList.value
        .filter((relatedPost) => relatedPost.id !== post.value?.id)
        .map((post) => ({
          value: post.id,
          label: post.title,
        }))
    );

    /** Form State **/
    const isSubmitting = ref<boolean>(false);
    const values = ref<FormValues>(
      convertPostToFormValues(
        post.value,
        languageOptionList.value,
        postOptionList.value,
        moduleConfig.value?.fields ?? [],
        statusOptions.value
      )
    );
    const errors = ref<Record<string, string>>({});

    watch([post, languageOptionList, postOptionList, moduleConfig], () => {
      values.value = convertPostToFormValues(
        post.value,
        languageOptionList.value,
        postOptionList.value,
        moduleConfig.value?.fields ?? [],
        statusOptions.value
      );
    });

    function submitForm(event: TagerFormSubmitEvent) {
      isSubmitting.value = true;

      const creationBody = convertFormValuesToCreationPayload(values.value);
      const updateBody = convertFormValuesToUpdatePayload(values.value);

      const requestPromise = isCreation.value
        ? createBlogPost(creationBody)
        : updateBlogPost(postId.value, updateBody);

      requestPromise
        .then(({ data }) => {
          errors.value = {};

          if (event.type === 'create') {
            context.root.$router.push(
              getBlogPostFormUrl({ postId: String(data.id) })
            );
          }

          if (event.type === 'create_exit' || event.type === 'save_exit') {
            if (context.root.$previousRoute) {
              context.root.$router.back();
            } else {
              context.root.$router.push(getBlogPostListUrl());
            }
          }

          if (event.type === 'create_create-another') {
            values.value = convertPostToFormValues(
              null,
              languageOptionList.value,
              postOptionList.value,
              moduleConfig.value?.fields ?? [],
              statusOptions.value
            );
          }

          context.root.$toast({
            variant: 'success',
            title: context.root.$t('blog:success'),
            body: isCreation.value
              ? context.root.$t('blog:blogPostWasSuccessfullyCreated')
              : context.root.$t('blog:blogPostWasSuccessfullyUpdated'),
          });
        })
        .catch((error) => {
          console.error(error);
          errors.value = convertRequestErrorToMap(error);
          context.root.$toast({
            variant: 'danger',
            title: context.root.$t('blog:error'),
            body: isCreation.value
              ? context.root.$t('blog:blogPostCreationWasFailed')
              : context.root.$t('blog:blogPostUpdateWasFailed'),
          });
        })
        .finally(() => {
          isSubmitting.value = false;
        });
    }

    /** Category Options */

    const categoryOptionList = computed<OptionType<number>[]>(() =>
      convertCategoryListToOptions(
        categoryList.value,
        values.value.language?.value ?? null
      )
    );

    watch([categoryOptionList, moduleConfig], () => {
      function isOptionExist(
        selectedCategoryOption: OptionType<number>
      ): boolean {
        return categoryOptionList.value.some(
          (option) => option.value === selectedCategoryOption.value
        );
      }

      if (isCreation.value) {
        if (moduleConfig?.value?.defaultCategories) {
          const defaultIds = moduleConfig.value.defaultCategories.map(
            (item: { id: number }) => item.id
          );
          values.value.categories = categoryOptionList.value.filter(
            (item: OptionType<number>) => {
              return defaultIds.indexOf(item.value) !== -1;
            }
          );
        }
      }

      values.value.categories = values.value.categories.filter(isOptionExist);
    });

    /** Misc */

    const isContentLoading = computed<boolean>(
      () =>
        isPostLoading.value ||
        isCategoryListLoading.value ||
        isPostListLoading.value ||
        isModuleConfigLoading.value
    );

    function getUploadAdapterOptions() {
      return { uploadScenario: moduleConfig.value?.fileScenarios.content };
    }

    const blogPagePath = computed<string>(() => {
      const origin = process.env.VUE_APP_WEBSITE_URL || window.location.origin;
      return origin + (post.value?.urlTemplate ?? '');
    });

    const tabList = computed<TabType[]>(() => {
      const hasErrors = createTabErrorFinder(errors.value);
      return [
        {
          id: 'common',
          label: context.root.$t('blog:common'),
          hasErrors: hasErrors([
            'title',
            'language',
            'urlAlias',
            'excerpt',
            'body',
            'date',
          ]),
        },
        {
          id: 'images',
          label: context.root.$t('blog:images'),
          hasErrors: hasErrors(['coverImage', 'image']),
        },
        {
          id: 'relations',
          label: context.root.$t('blog:relations'),
          hasErrors: hasErrors(['categories', 'relatedPosts', 'tags']),
        },
        values.value.additionalFields.length > 0
          ? {
              id: 'additional',
              label: context.root.$t('blog:additionalFields'),
              hasErrors: hasErrors([]),
            }
          : null,
        {
          id: 'seo',
          label: 'SEO',
          hasErrors: hasErrors([
            'pageTitle',
            'pageDescription',
            'openGraphImage',
          ]),
        },
      ].filter(isNotNullish);
    });

    const selectedTabId = ref<string>(tabList.value[0].id);

    const headerButtonList = computed<
      { text: string; href: string; target?: string }[]
    >(() =>
      [
        post.value
          ? {
              text: context.root.$t('blog:viewPost'),
              href: process.env.VUE_APP_WEBSITE_URL + post.value.url,
              target: '_blank',
            }
          : null,
      ].filter(isNotNullish)
    );

    function handleSeoFieldGroupChange({
      title,
      description,
      image,
    }: SeoChangeEvent) {
      values.value.pageTitle = title;
      values.value.pageDescription = description;
      values.value.openGraphImage = image;
    }

    function handleTitleChange(value: string) {
      if (urlAliasChanged.value === false) {
        values.value.urlAlias = urlTranslit(value);
      }
    }

    function handleAliasChange() {
      urlAliasChanged.value = true;
    }

    const urlAliasTemplate = computed<string>(() => {
      if (!moduleConfig.value || !moduleConfig.value.urlPostTemplate) {
        return '';
      }

      let result = moduleConfig.value.urlPostTemplate;

      if (values.value.language) {
        result = result.replace('{language}', values.value.language.value);
      }

      if (postId.value !== 'create') {
        result = result.replace('{id}', postId.value);
      }

      return result;
    });

    const handleCategoriesChange = (selectedOptions: OptionType<number>[]) => {
      const newSelectedOptions: OptionType<number>[] = [];

      selectedOptions.forEach((selectedOption) => {
        const findTreeSelectedCategory = (categoryId: Nullable<number>) => {
          const foundSelectedCategory = categoryList.value.find(
            ({ id }) => id === categoryId
          );

          if (!foundSelectedCategory) {
            return;
          }

          const newSelectedOption: OptionType<number> = {
            value: foundSelectedCategory.id,
            label: foundSelectedCategory.name,
          };

          if (
            !newSelectedOptions.some(
              ({ value }) => value === newSelectedOption.value
            )
          ) {
            newSelectedOptions.push(newSelectedOption);
          }

          if (foundSelectedCategory.parent) {
            findTreeSelectedCategory(foundSelectedCategory.parent.id);
          }
        };

        findTreeSelectedCategory(selectedOption.value);
      });

      values.value.categories = newSelectedOptions;
    };

    return {
      isCreation,
      postId,
      pagePath: blogPagePath,
      categoryOptionList,
      values,
      errors,
      isContentLoading,
      postListUrl: getBlogPostListUrl(),
      submitForm,
      isLangSpecific,
      languageOptionList,
      isSubmitting,
      moduleConfig,
      postOptionList,
      getUploadAdapterOptions,
      tabList,
      selectedTabId,
      headerButtonList,
      handleSeoFieldGroupChange,
      handleTitleChange,
      handleAliasChange,
      urlAliasTemplate,
      handleCategoriesChange,

      statusOptions,
    };
  },
});
</script>
