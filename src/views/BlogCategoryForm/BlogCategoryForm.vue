<template>
  <page
    :title="isCreation ? 'Create Blog category' : 'Update Blog category'"
    :is-content-loading="isContentLoading"
    :footer="{
      backHref: categoryListUrl,
      onSubmit: submitForm,
      isSubmitting: isSubmitting,
    }"
  >
    <template v-slot:content>
      <form novalidate @submit.prevent="submitForm">
        <form-field
          v-model="values.name"
          name="name"
          label="Name"
          :error="errors.name"
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

import {
  convertRequestErrorToMap,
  Nullable,
  useResource,
} from '@tager/admin-services';
import { OptionType } from '@tager/admin-ui';

import {
  createBlogCategory,
  getBlogCategory,
  updateBlogCategory,
} from '../../services/requests';
import { BlogCategory } from '../../typings/model';
import { getBlogCategoryListUrl } from '../../constants/paths';
import useModuleConfig from '../../hooks/useModuleConfig';

import {
  CategoryFormValues,
  convertCategoryFormValuesToCreationPayload,
  convertCategoryFormValuesToUpdatePayload,
  convertCategoryToFormValues,
} from './BlogCategoryForm.helpers';

export default defineComponent({
  name: 'BlogCategoryForm',
  setup(props, context) {
    const categoryId = computed<string>(
      () => context.root.$route.params.categoryId
    );
    const isCreation = computed<boolean>(() => categoryId.value === 'create');

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

    /** Fetch Category */

    const [
      fetchCategory,
      { data: category, loading: isCategoryLoading },
    ] = useResource<Nullable<BlogCategory>>({
      fetchResource: () => getBlogCategory(categoryId.value),
      initialValue: null,
      context,
      resourceName: 'Category',
    });

    onMounted(() => {
      if (isCreation.value) return;

      fetchCategory();
    });

    watch(categoryId, () => {
      if (isCreation.value) return;

      fetchCategory();
    });

    /** Form State */
    const values = ref<CategoryFormValues>(
      convertCategoryToFormValues(category.value, languageOptionList.value)
    );
    const errors = ref<Record<string, string>>({});
    const isSubmitting = ref<boolean>(false);

    watch(category, () => {
      values.value = convertCategoryToFormValues(
        category.value,
        languageOptionList.value
      );
    });

    function submitForm({ shouldExit }: { shouldExit: boolean }) {
      isSubmitting.value = true;

      const creationBody = convertCategoryFormValuesToCreationPayload(
        values.value
      );
      const updateBody = convertCategoryFormValuesToUpdatePayload(values.value);

      const requestPromise = isCreation.value
        ? createBlogCategory(creationBody)
        : updateBlogCategory(categoryId.value, updateBody);

      requestPromise
        .then(() => {
          errors.value = {};

          if (shouldExit) {
            context.root.$router.push(getBlogCategoryListUrl());
          }

          context.root.$toast({
            variant: 'success',
            title: 'Success',
            body: `Blog category was successfully ${
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
            body: `Blog category ${
              isCreation.value ? 'creation' : 'update'
            } was failed`,
          });
        })
        .finally(() => {
          isSubmitting.value = false;
        });
    }

    /** Misc */

    const isContentLoading = computed<boolean>(
      () => isCategoryLoading.value || isModuleConfigLoading.value
    );

    const categoryPagePath = computed<string>(() => {
      const origin = process.env.VUE_APP_WEBSITE_URL || window.location.origin;
      return origin + (category.value?.urlTemplate ?? '');
    });

    return {
      isCreation,
      isContentLoading: isContentLoading,
      values,
      errors,
      isLangSpecific,
      languageOptionList,
      pagePath: categoryPagePath,
      categoryListUrl: getBlogCategoryListUrl(),
      submitForm,
      isSubmitting,
    };
  },
});
</script>

<style scoped lang="scss"></style>
