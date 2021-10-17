<template>
  <page
    :title="
      isCreation ? $t('blog:createBlogCategory') : $t('blog:updateBlogCategory')
    "
    :is-content-loading="isContentLoading"
  >
    <template v-slot:content>
      <form novalidate @submit.prevent="submitForm">
        <template v-if="isCreation">
          <form-field-select
            v-if="isLangSpecific"
            v-model="values.language"
            name="language"
            :label="$t('blog:language')"
            :options="languageOptionList"
            :error="errors.language"
          />

          <form-field
            v-model="values.name"
            name="name"
            :label="$t('blog:name')"
            :error="errors.name"
          />

          <form-field-select
            v-model="values.parent"
            name="parentCategory"
            :label="$t('blog:parentCategory')"
            :options="categoryOptionList"
            :error="errors.parent"
          />

          <form-field-url-alias-input
            id="urlAlias"
            v-model="values.urlAlias"
            name="urlAlias"
            :label="$t('blog:link')"
            :url-template="pagePath"
            :error="errors.urlAlias"
          />
        </template>

        <template v-else>
          <tab-list
            :tab-list="tabList"
            :selected-tab-id="selectedTabId"
            @tab:update="selectedTabId = $event.tabId"
          />

          <template v-if="selectedTabId === 'common'">
            <form-field-select
              v-if="isLangSpecific"
              v-model="values.language"
              name="language"
              :label="$t('blog:language')"
              :options="languageOptionList"
              :error="errors.language"
            />

            <form-field
              v-model="values.name"
              name="name"
              :label="$t('blog:name')"
              :error="errors.name"
            />

            <form-field-select
              v-model="values.parent"
              name="parentCategory"
              :label="$t('blog:parentCategory')"
              :options="categoryOptionList"
              :error="errors.parent"
            />

            <form-field-url-alias-input
              id="urlAlias"
              v-model="values.urlAlias"
              name="urlAlias"
              :label="$t('blog:link')"
              :url-template="pagePath"
              :error="errors.urlAlias"
            />
          </template>

          <template v-if="selectedTabId === 'seo'">
            <seo-field-group
              :title="values.pageTitle"
              :title-error-message="errors.pageTitle"
              :description="values.pageDescription"
              :description-error-message="errors.pageDescription"
              :should-display-keywords="false"
              :keywords="values.pageKeywords"
              :keywords-error-message="errors.pageKeywords"
              :image="values.openGraphImage"
              :image-scenario="imageScenario"
              :image-error-message="errors.openGraphImage"
              @change="handleSeoFieldGroupChange"
            />
          </template>
        </template>
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
import { computed, defineComponent, ref, watch } from '@vue/composition-api';

import {
  convertRequestErrorToMap,
  getWebsiteOrigin,
} from '@tager/admin-services';
import {
  OptionType,
  FormFooter,
  TagerFormSubmitEvent,
  SeoChangeEvent,
  TabType,
  useTranslation,
} from '@tager/admin-ui';

import { createCategory, updateCategory } from '@/services/requests';
import { CategoryFormValues, Language } from '@/typings/model';
import {
  getBlogCategoryFormUrl,
  getBlogCategoryListUrl,
} from '@/constants/paths';
import {
  useFetchCategories,
  useFetchCategory,
  useFetchModuleConfig,
} from '@/hooks';
import { convertCategoryListToOptions } from '@/views/Posts/PostForm/PostForm.helpers';

import {
  convertCategoryFormValuesToPayload,
  convertCategoryToFormValues,
} from './CategoryForm.helpers';

export default defineComponent({
  name: 'CategoryForm',
  components: { FormFooter },
  setup(props, context) {
    const { t } = useTranslation(context);
    const categoryId = computed<string>(
      () => context.root.$route.params.categoryId
    );
    const isCreation = computed<boolean>(() => categoryId.value === 'create');

    /** Fetch module config */

    const {
      data: moduleConfig,
      loading: isModuleConfigLoading,
    } = useFetchModuleConfig({ context });

    const languageList = computed<Language[]>(
      () => moduleConfig.value?.languages ?? []
    );

    const languageOptionList = computed<OptionType[]>(() =>
      languageList.value.map(({ id, name }) => ({ value: id, label: name }))
    );

    const isLangSpecific = computed<boolean>(
      () => languageOptionList.value.length > 0
    );

    const imageScenario = computed<string | null>(
      () => moduleConfig.value?.fileScenarios?.openGraph ?? null
    );

    /** Fetch Categories */

    const {
      data: categories,
      loading: isCategoriesLoading,
    } = useFetchCategories({ context });

    /** Fetch Category */

    const { data: category, loading: isCategoryLoading } = useFetchCategory({
      context,
      categoryId,
      isCreation,
    });

    /** Form State */
    const isSubmitting = ref<boolean>(false);
    const values = ref<CategoryFormValues>(
      convertCategoryToFormValues(category.value, languageOptionList.value)
    );
    const errors = ref<Record<string, string>>({});

    watch(category, () => {
      values.value = convertCategoryToFormValues(
        category.value,
        languageOptionList.value
      );
    });

    function submitForm(event: TagerFormSubmitEvent) {
      isSubmitting.value = true;

      const body = convertCategoryFormValuesToPayload(values.value);

      const requestPromise = isCreation.value
        ? createCategory(body)
        : updateCategory(categoryId.value, body);

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

    /** Category Options */

    const categoryOptionList = computed<OptionType<number>[]>(() =>
      convertCategoryListToOptions(
        categories.value,
        values.value.language?.value ?? null
      )
    );

    /** Misc */

    const isContentLoading = computed<boolean>(
      () =>
        isCategoryLoading.value ||
        isModuleConfigLoading.value ||
        isCategoriesLoading.value
    );

    const categoryPagePath = computed<string>(() => {
      return `${getWebsiteOrigin()}${category.value?.urlTemplate ?? ''}`;
    });

    /** SEO **/

    function handleSeoFieldGroupChange({
      title,
      description,
      keywords,
      image,
    }: SeoChangeEvent) {
      values.value.pageTitle = title;
      values.value.pageDescription = description;
      values.value.pageKeywords = keywords;
      values.value.openGraphImage = image;
    }

    /** Tabs */

    const tabList = computed<TabType[]>(() => [
      { id: 'common', label: t('blog:tabs.common') },
      { id: 'seo', label: t('blog:tabs.seo') },
    ]);

    const selectedTabId = ref<string>(tabList.value[0].id);

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
      moduleConfig,
      categoryOptionList,

      // SEO
      imageScenario,
      handleSeoFieldGroupChange,

      // Tabs
      tabList,
      selectedTabId,
    };
  },
});
</script>
