<template>
  <page
    :title="isCreation ? 'Create Blog post' : 'Update Blog post'"
    :is-content-loading="isContentLoading"
    :footer="{
      backHref: postListUrl,
      onSubmit: submitForm,
      isSubmitting: isSubmitting,
    }"
  >
    <template v-slot:content>
      <form novalidate @submit.prevent="submitForm">
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
          :image-upload-scenario="
            moduleConfig ? moduleConfig.postContentImageScenario : null
          "
        />

        <form-field-multi-select
          v-model="values.categories"
          name="categories"
          label="Categories"
          :options="categoryOptionList"
          :error="errors.categories"
        />

        <form-field
          v-model="values.date"
          name="date"
          label="Date"
          type="date"
          :error="errors.date"
        />

        <form-field-file-input
          v-model="values.image"
          name="image"
          label="Image"
          file-type="image"
        />

        <form-field-file-input
          v-model="values.coverImage"
          label="Cover image"
          name="coverImage"
          file-type="image"
        />

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
import { convertRequestErrorToMap, Nullable } from '@tager/admin-services';
import { OptionType } from '@tager/admin-ui';

import {
  createBlogPost,
  getBlogPost,
  updateBlogPost,
} from '../../services/requests';
import { PostFull } from '../../typings/model';
import { getBlogPostListUrl } from '../../constants/paths';
import useResource from '../../hooks/useResource';
import useModuleConfig from '../../hooks/useModuleConfig';
import useBlogCategoryList from '../../hooks/useBlogCategoryList';

import {
  convertCategoryListToOptions,
  convertFormValuesToCreationPayload,
  convertFormValuesToUpdatePayload,
  convertPostToFormValues,
  FormValues,
} from './BlogPostForm.helpers';

export default defineComponent({
  name: 'BlogPostForm',
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

    /** Form State */
    const values = ref<FormValues>(
      convertPostToFormValues(post.value, languageOptionList.value)
    );
    const errors = ref<Record<string, string>>({});
    const isSubmitting = ref<boolean>(false);

    watch(post, () => {
      values.value = convertPostToFormValues(
        post.value,
        languageOptionList.value
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
        isModuleConfigLoading.value
    );

    const blogPagePath = computed<string>(() => {
      const origin = process.env.VUE_APP_WEBSITE_URL || window.location.origin;
      return origin + post.value?.urlTemplate ?? '';
    });

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
    };
  },
});
</script>

<style scoped lang="scss"></style>
