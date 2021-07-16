<template>
  <page
    :title="
      isCreation ? $t('blog:createBlogCategory') : $t('blog:updateBlogCategory')
    "
    :is-content-loading="isContentLoading"
  >
    <template v-slot:content>
      <form novalidate @submit.prevent="submitForm">
        <form-field
          v-model="values.name"
          name="name"
          :label="$t('blog:name')"
          :error="errors.name"
        />

        <form-field-select
          v-if="isCreation && isLangSpecific"
          v-model="values.language"
          name="language"
          :label="$t('blog:language')"
          :options="languageOptionList"
          :error="errors.language"
        />

        <form-field-url-alias-input
          v-if="!isCreation"
          id="urlAlias"
          v-model="values.urlAlias"
          name="urlAlias"
          :label="$t('blog:URLAlias')"
          :url-template="pagePath"
          :error="errors.urlAlias"
        />

        <form-field
          v-model="values.pageTitle"
          name="pageTitle"
          :label="$t('blog:pageTitle')"
          :error="errors.pageTitle"
        />

        <form-field
          v-model="values.pageDescription"
          name="pageDescription"
          :label="$t('blog:pageDescription')"
          type="textarea"
          :error="errors.pageDescription"
        />

        <form-field-file-input
          v-model="values.openGraphImage"
          :label="$t('blog:openGraphImage')"
          name="openGraphImage"
          file-type="image"
          :image-scenario="moduleConfig ? moduleConfig.fileScenarios.openGraph : null"
        />
      </form>
    </template>

    <template v-slot:footer>
      <FormFooter
        :back-href="categoryListUrl"
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
  Nullable,
  useResource,
} from '@tager/admin-services';
import { OptionType, FormFooter, TagerFormSubmitEvent } from '@tager/admin-ui';

import {
  createBlogCategory,
  getBlogCategory,
  updateBlogCategory,
} from '../../services/requests';
import { BlogCategory } from '../../typings/model';
import {
  getBlogCategoryFormUrl,
  getBlogCategoryListUrl,
} from '../../constants/paths';
import useModuleConfig from '../../hooks/useModuleConfig';

import {
  CategoryFormValues,
  convertCategoryFormValuesToCreationPayload,
  convertCategoryFormValuesToUpdatePayload,
  convertCategoryToFormValues,
} from './BlogCategoryForm.helpers';

export default defineComponent({
  name: 'BlogCategoryForm',
  components: { FormFooter },
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

    function submitForm(event: TagerFormSubmitEvent) {
      isSubmitting.value = true;

      const creationBody = convertCategoryFormValuesToCreationPayload(
        values.value
      );
      const updateBody = convertCategoryFormValuesToUpdatePayload(values.value);

      const requestPromise = isCreation.value
        ? createBlogCategory(creationBody)
        : updateBlogCategory(categoryId.value, updateBody);

      requestPromise
        .then(({ data }) => {
          errors.value = {};

          if (event.type === 'create') {
            context.root.$router.push(
              getBlogCategoryFormUrl({ categoryId: String(data.id) })
            );
          }

          if (event.type === 'create_exit' || event.type === 'save_exit') {
            context.root.$router.push(getBlogCategoryListUrl());
          }

          if (event.type === 'create_create-another') {
            values.value = convertCategoryToFormValues(
              null,
              languageOptionList.value
            );
          }

          context.root.$toast({
            variant: 'success',
            title: context.root.$t('blog:success'),
            body: isCreation.value
              ? context.root.$t('blog:blogCategoryWasSuccessfullyCreated')
              : context.root.$t('blog:blogCategoryWasSuccessfullyUpdated'),
          });
        })
        .catch((error) => {
          console.error(error);
          errors.value = convertRequestErrorToMap(error);
          context.root.$toast({
            variant: 'danger',
            title: context.root.$t('blog:error'),
            body: isCreation.value
              ? context.root.$t('blog:blogCategoryCreationWasFailed')
              : context.root.$t('blog:blogCategoryUpdateWasFailed'),
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
      moduleConfig
    };
  },
});
</script>

<style scoped lang="scss"></style>
