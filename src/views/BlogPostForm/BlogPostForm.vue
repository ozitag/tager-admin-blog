<template>
  <page
    :title="isCreation ? 'Create Blog post' : 'Update Blog post'"
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
          <form-field
            v-model="values.title"
            name="title"
            label="Title"
            :error="errors.title"
          />

          <form-field-select
            v-if="isCreation && isLangSpecific"
            v-model="values.language"
            name="language"
            label="Language"
            :options="languageOptionList"
            :error="errors.language"
          />
          <form-field-url-alias-input
            v-if="!isCreation"
            id="urlAlias"
            v-model="values.urlAlias"
            name="urlAlias"
            label="URL alias"
            :url-template="pagePath"
            :error="errors.urlAlias"
          />

          <form-field
            v-model="values.excerpt"
            name="excerpt"
            label="Excerpt"
            type="textarea"
            :error="errors.excerpt"
          />
          <form-field-rich-text-input
            v-model="values.body"
            name="body"
            label="Body"
            :error="errors.body"
            :get-upload-adapter-options="getUploadAdapterOptions"
          />
          <ShortCodeConstructor
            :short-code-config-list="
              moduleConfig ? moduleConfig.shortcodes : []
            "
          />

          <form-field
            v-model="values.date"
            name="date"
            label="Date"
            type="date"
            :error="errors.date"
          />
        </template>

        <template v-if="selectedTabId === 'images'">
          <form-field-file-input
            v-model="values.coverImage"
            label="Cover image"
            name="coverImage"
            file-type="image"
          />

          <form-field-file-input
            v-model="values.image"
            name="image"
            label="Inner Image"
            file-type="image"
          />
        </template>

        <template v-if="selectedTabId === 'relations'">
          <form-field
            v-model="values.tags"
            name="tags"
            label="Tags"
            :error="errors.tags"
          />
          <form-field-multi-select
            v-model="values.categories"
            name="categories"
            label="Categories"
            :options="categoryOptionList"
            :error="errors.categories"
          />
          <form-field-multi-select
            v-model="values.relatedPosts"
            name="relatedPosts"
            label="Related posts"
            :options="postOptionList"
            :error="errors.relatedPosts"
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
          <form-field
            v-model="values.pageTitle"
            name="pageTitle"
            label="Page title"
            :error="errors.pageTitle"
          />

          <form-field
            v-model="values.pageDescription"
            name="pageDescription"
            label="Page description"
            type="textarea"
            :error="errors.pageDescription"
          />

          <form-field-file-input
            v-model="values.openGraphImage"
            label="Open graph image"
            name="openGraphImage"
            file-type="image"
          />
        </template>
      </form>
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
} from '@tager/admin-services';
import {
  createTabErrorFinder,
  OptionType,
  TabType,
  ShortCodeConstructor,
} from '@tager/admin-ui';
import { DynamicField } from '@tager/admin-dynamic-field';

import {
  createBlogPost,
  getBlogPost,
  updateBlogPost,
} from '../../services/requests';
import { PostFull } from '../../typings/model';
import { getBlogPostListUrl } from '../../constants/paths';
import useModuleConfig from '../../hooks/useModuleConfig';
import useBlogCategoryList from '../../hooks/useBlogCategoryList';
import useBlogPostList from '../../hooks/useBlogPostList';

import {
  convertCategoryListToOptions,
  convertFormValuesToCreationPayload,
  convertFormValuesToUpdatePayload,
  convertPostToFormValues,
  FormValues,
} from './BlogPostForm.helpers';

export default defineComponent({
  name: 'BlogPostForm',
  components: { DynamicField, ShortCodeConstructor },
  setup(props, context) {
    const postId = computed<string>(() => context.root.$route.params.postId);
    const isCreation = computed<boolean>(() => postId.value === 'create');

    /** Fetch module config */
    const {
      data: moduleConfig,
      loading: isModuleConfigLoading,
    } = useModuleConfig({ context });

    const languageOptionList = computed<Array<OptionType>>(
      () =>
        moduleConfig.value?.languages.map((lang) => ({
          value: lang.id,
          label: lang.name,
        })) ?? []
    );

    const isLangSpecific = computed(() => languageOptionList.value.length > 0);

    /** Fetch category list */
    const {
      data: categoryList,
      loading: isCategoryListLoading,
    } = useBlogCategoryList({ context });

    /** Fetch Post */

    const [fetchPost, { data: post, loading: isPostLoading }] = useResource<
      Nullable<PostFull>
    >({
      fetchResource: () => getBlogPost(postId.value),
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
    const { data: postList, loading: isPostListLoading } = useBlogPostList({
      context,
    });

    const postOptionList = computed<Array<OptionType<number>>>(() =>
      postList.value
        .filter((relatedPost) => relatedPost.id !== post.value?.id)
        .map((post) => ({
          value: post.id,
          label: post.title,
        }))
    );

    /** Form State */
    const values = ref<FormValues>(
      convertPostToFormValues(
        post.value,
        languageOptionList.value,
        postOptionList.value,
        moduleConfig.value?.fields ?? []
      )
    );
    const errors = ref<Record<string, string>>({});
    const isSubmitting = ref<boolean>(false);

    watch([post, languageOptionList, postOptionList, moduleConfig], () => {
      values.value = convertPostToFormValues(
        post.value,
        languageOptionList.value,
        postOptionList.value,
        moduleConfig.value?.fields ?? []
      );
    });

    function submitForm() {
      isSubmitting.value = true;

      const creationBody = convertFormValuesToCreationPayload(values.value);
      const updateBody = convertFormValuesToUpdatePayload(values.value);

      const requestPromise = isCreation.value
        ? createBlogPost(creationBody)
        : updateBlogPost(postId.value, updateBody);

      requestPromise
        .then(() => {
          errors.value = {};
          context.root.$router.push(getBlogPostListUrl());

          context.root.$toast({
            variant: 'success',
            title: 'Success',
            body: `Blog post was successfully ${
              isCreation.value ? 'created' : 'updated'
            }`,
          });
        })
        .catch((error) => {
          console.error(error);
          errors.value = convertRequestErrorToMap(error);
          context.root.$toast({
            variant: 'danger',
            title: 'Error',
            body: `Blog post ${
              isCreation.value ? 'creation' : 'update'
            } was failed`,
          });
        })
        .finally(() => {
          isSubmitting.value = false;
        });
    }

    /** Category Options */

    const categoryOptionList = computed<Array<OptionType<number>>>(() =>
      convertCategoryListToOptions(
        categoryList.value,
        values.value.language?.value ?? null
      )
    );

    watch([categoryOptionList], () => {
      function isOptionExist(
        selectedCategoryOption: OptionType<number>
      ): boolean {
        return categoryOptionList.value.some(
          (option) => option.value === selectedCategoryOption.value
        );
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
      return { uploadScenario: moduleConfig.value?.postContentImageScenario };
    }

    const blogPagePath = computed<string>(() => {
      const origin = process.env.VUE_APP_WEBSITE_URL || window.location.origin;
      return origin + (post.value?.urlTemplate ?? '');
    });

    const tabList = computed<Array<TabType>>(() => {
      const hasErrors = createTabErrorFinder(errors.value);
      return [
        {
          id: 'common',
          label: 'Common',
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
          label: 'Images',
          hasErrors: hasErrors(['coverImage', 'image']),
        },
        {
          id: 'relations',
          label: 'Relations',
          hasErrors: hasErrors(['categories', 'relatedPosts', 'tags']),
        },
        values.value.additionalFields.length > 0
          ? {
              id: 'additional',
              label: 'Additional Fields',
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
      Array<{ text: string; href: string; target?: string }>
    >(() =>
      [
        post.value
          ? {
              text: 'View Post',
              href: process.env.VUE_APP_WEBSITE_URL + post.value.url,
              target: '_blank',
            }
          : null,
      ].filter(isNotNullish)
    );

    return {
      isCreation,
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
    };
  },
});
</script>

<style scoped lang="scss"></style>
