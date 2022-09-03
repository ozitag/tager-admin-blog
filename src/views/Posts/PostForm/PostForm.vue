<template>
  <Page
    :title="
      isCreation ? $i18n.t('blog:createPost') : $i18n.t('blog:updatePost')
    "
    :is-content-loading="isContentLoading"
    :header-buttons="headerButtonList"
    :footer="{
      backHref: postListUrl,
      onSubmit: submitForm,
      isSubmitting: isSubmitting,
    }"
  >
    <template #content>
      <form novalidate @submit.prevent="submitForm">
        <TabList
          :tab-list="tabList"
          :selected-tab-id="selectedTabId"
          @tab:update="selectedTabId = $event.tabId"
        />

        <template v-if="selectedTabId === 'common'">
          <FormFieldSelect
            v-if="isCreation && isLangSpecific"
            v-model:value="values.language"
            name="language"
            :label="$i18n.t('blog:language')"
            :options="languageOptionList"
            :error="errors.language"
          />

          <FormField
            v-model:value="values.title"
            name="title"
            :label="$i18n.t('blog:title')"
            :error="errors.title"
            @input="handleTitleChange"
          />

          <FormFieldUrlAliasInput
            id="urlAlias"
            v-model:value="values.urlAlias"
            name="urlAlias"
            :label="$i18n.t('blog:link')"
            :url-template="urlAliasTemplate"
            :error="errors.urlAlias"
            @change="handleAliasChange"
          />

          <div class="status">
            <div class="status-value">
              <FormFieldSelect
                v-model:value="values.status"
                name="status"
                :error="errors.status"
                :label="$i18n.t('blog:status')"
                :no-options-message="$i18n.t('blog:noTemplates')"
                :options="statusOptions"
              />
            </div>
            <div
              v-if="
                values.status.value === 'PUBLISHED' ||
                values.status.value === 'DRAFT'
              "
              class="status-checkbox"
            >
              <FormFieldCheckbox
                v-model:checked="values.statusDateEnabled"
                name="statusDateEnabled"
                :label="
                  $i18n.t(
                    values.status.value === 'PUBLISHED'
                      ? 'blog:scheduleArchive'
                      : 'blog:schedulePublish'
                  )
                "
                :error="errors.status"
              />
            </div>
            <div
              v-if="
                values.statusDateEnabled &&
                (values.status.value === 'PUBLISHED' ||
                  values.status.value === 'DRAFT')
              "
              class="status-date"
            >
              <FormField
                v-model:value="values.statusDate"
                name="statusDate"
                type="date"
                :label="
                  $i18n.t(
                    values.status.value === 'PUBLISHED'
                      ? 'blog:archiveAt'
                      : 'blog:publishAt'
                  )
                "
                :error="errors.statusDate"
              />
            </div>
          </div>

          <FormField
            v-model:value="values.datetime"
            name="datetime"
            :label="$i18n.t('blog:date')"
            type="date"
            :error="errors.datetime"
          />

          <FormField
            v-model:value="values.excerpt"
            name="excerpt"
            :label="$i18n.t('blog:excerpt')"
            type="textarea"
            :error="errors.excerpt"
          />

          <FormFieldRichTextInput
            v-model:value="values.body"
            name="body"
            :label="$i18n.t('blog:body')"
            :error="errors.body"
            :get-upload-adapter-options="getUploadAdapterOptions"
          />

          <ShortCodeConstructor
            :short-code-config-list="
              moduleConfig ? moduleConfig.shortcodes : []
            "
          />
        </template>

        <template v-if="selectedTabId === 'images'">
          <FormFieldFileInput
            v-model:value="values.coverImage"
            :label="$i18n.t('blog:coverImage')"
            name="coverImage"
            file-type="image"
            :scenario="moduleConfig ? moduleConfig.fileScenarios.cover : null"
          />

          <FormFieldFileInput
            v-model:value="values.image"
            name="image"
            :label="$i18n.t('blog:innerImage')"
            file-type="image"
            :scenario="moduleConfig ? moduleConfig.fileScenarios.image : null"
          />

          <FormFieldFileInput
            v-model:value="values.imageMobile"
            name="imageMobile"
            :label="$i18n.t('blog:innerImageMobile')"
            file-type="image"
            :scenario="
              moduleConfig ? moduleConfig.fileScenarios.imageMobile : null
            "
          />
        </template>

        <template v-if="selectedTabId === 'relations'">
          <FormField
            v-model:value="values.tags"
            name="tags"
            :label="$i18n.t('blog:tags')"
            :error="errors.tags"
          />

          <FormFieldMultiSelect
            v-model:selected-options="values.categories"
            name="categories"
            :label="$i18n.t('blog:categories')"
            :options="categoryOptionList"
            :error="errors.categories"
            @change="handleCategoriesChange"
          />

          <FormFieldMultiSelect
            v-model:selected-options="values.relatedPosts"
            name="relatedPosts"
            :label="$i18n.t('blog:relatedPosts')"
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
          <SeoFieldGroup
            :title="values.pageTitle"
            :title-error-message="errors.pageTitle"
            :title-label="$i18n.t('blog:pageTitle')"
            :description="values.pageDescription"
            :description-error-message="errors.pageDescription"
            :description-label="$i18n.t('blog:pageDescription')"
            :image="values.openGraphImage"
            :image-error-message="errors.openGraphImage"
            :image-label="$i18n.t('blog:openGraphImage')"
            :image-scenario="
              moduleConfig ? moduleConfig.fileScenarios.openGraph : null
            "
            @change="handleSeoFieldGroupChange"
          />
        </template>
      </form>
    </template>

    <template #footer>
      <FormFooter
        :back-href="postListUrl"
        :is-submitting="isSubmitting"
        :is-creation="isCreation"
        :can-create-another="isCreation"
        @submit="submitForm"
      />
    </template>
  </Page>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import {
  convertRequestErrorToMap,
  isNotNullish,
  Nullable,
  useResource,
  urlTranslit,
  useI18n,
  useToast,
  navigateBack,
} from '@tager/admin-services';
import {
  createTabErrorFinder,
  OptionType,
  TabType,
  ShortCodeConstructor,
  SeoChangeEvent,
  FormFooter,
  TagerFormSubmitEvent,
  FormFieldSelect,
  FormField,
  FormFieldUrlAliasInput,
  FormFieldCheckbox,
  FormFieldRichTextInput,
  FormFieldFileInput,
  FormFieldMultiSelect,
  SeoFieldGroup,
} from '@tager/admin-ui';
import { DynamicField } from '@tager/admin-dynamic-field';
import { Page } from '@tager/admin-layout';

import { getBlogPostFormUrl, getBlogPostListUrl } from '../../../utils/paths';
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
import TabList from './components/TabList/TabList.vue';

export default defineComponent({
  name: 'BlogPostForm',
  components: {
    SeoFieldGroup,
    FormFieldMultiSelect,
    FormFieldFileInput,
    FormFieldRichTextInput,
    FormFieldCheckbox,
    FormFieldUrlAliasInput,
    FormField,
    FormFieldSelect,
    TabList,
    Page,
    DynamicField,
    ShortCodeConstructor,
    FormFooter,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const toast = useToast();
    const { t } = useI18n();

    const postId = computed<string>(() => route.params.postId as string);
    const isCreation = computed<boolean>(() => postId.value === 'create');

    const urlAliasChanged = ref<boolean>(false);

    const statusOptions = computed<OptionType[]>(() => getStatusOptions(t));

    /** Fetch module config **/

    const { data: moduleConfig, loading: isModuleConfigLoading } =
      useFetchModuleConfig();

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

    const { data: categoryList, loading: isCategoryListLoading } =
      useFetchCategories();

    /** Fetch Post */

    const [fetchPost, { data: post, loading: isPostLoading }] = useResource<
      Nullable<PostFull>
    >({
      fetchResource: () =>
        postId.value ? getPost(postId.value) : new Promise(() => null),
      initialValue: null,
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
    const { data: postList, loading: isPostListLoading } = useFetchPosts();

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
            router.push(getBlogPostFormUrl({ postId: String(data.id) }));
          }

          if (event.type === 'create_exit' || event.type === 'save_exit') {
            navigateBack(router, getBlogPostListUrl());
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

          toast.show({
            variant: 'success',
            title: t('blog:success'),
            body: isCreation.value
              ? t('blog:blogPostWasSuccessfullyCreated')
              : t('blog:blogPostWasSuccessfullyUpdated'),
          });
        })
        .catch((error) => {
          console.error(error);
          errors.value = convertRequestErrorToMap(error);
          toast.show({
            variant: 'danger',
            title: t('blog:error'),
            body: isCreation.value
              ? t('blog:blogPostCreationWasFailed')
              : t('blog:blogPostUpdateWasFailed'),
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
          label: t('blog:common'),
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
          label: t('blog:images'),
          hasErrors: hasErrors(['coverImage', 'image']),
        },
        {
          id: 'relations',
          label: t('blog:relations'),
          hasErrors: hasErrors(['categories', 'relatedPosts', 'tags']),
        },
        values.value.additionalFields.length > 0
          ? {
              id: 'additional',
              label: t('blog:additionalFields'),
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
              text: t('blog:viewPost'),
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
      if (isCreation.value && urlAliasChanged.value === false) {
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

<style scoped lang="scss">
.status {
  display: flex;
  align-items: flex-end;
}

.status-value {
  flex-basis: 50%;
}

.status-checkbox {
  margin-left: 20px;
  padding-bottom: 8px;
}

.status-date {
  margin-left: 20px;
  flex: 1 1 1px;
}
</style>
