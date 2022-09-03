<template>
  <Page
    :title="
      isCreation
        ? $i18n.t('blog:createBlogCategory')
        : $i18n.t('blog:updateBlogCategory')
    "
    :is-content-loading="isContentLoading"
  >
    <template #content>
      <form novalidate @submit.prevent="submitForm">
        <template v-if="isCreation">
          <FormFieldSelect
            v-if="isLangSpecific"
            v-model:value="values.language"
            name="language"
            :label="$i18n.t('blog:language')"
            :options="languageOptionList"
            :error="errors.language"
          />

          <FormField
            v-model:value="values.name"
            name="name"
            :label="$i18n.t('blog:name')"
            :error="errors.name"
            @input="handleNameChange"
          />

          <FormFieldSelect
            v-if="!isLangSpecific || values.language"
            v-model:value="values.parent"
            name="parentCategory"
            :label="$i18n.t('blog:parentCategory')"
            :options="parentCategoryOptionList"
            :error="errors.parent"
          />

          <FormFieldUrlAliasInput
            id="urlAlias"
            v-model:value="values.urlAlias"
            name="urlAlias"
            :label="$i18n.t('blog:link')"
            :url-template="pagePath"
            :error="errors.urlAlias"
            @change="handleAliasChange"
          />
        </template>

        <template v-else>
          <TabList
            :tab-list="tabList"
            :selected-tab-id="selectedTabId"
            @tab:update="selectedTabId = $event.tabId"
          />

          <template v-if="selectedTabId === 'common'">
            <FormFieldSelect
              v-if="isLangSpecific"
              v-model:value="values.language"
              name="language"
              :label="$i18n.t('blog:language')"
              :options="languageOptionList"
              :error="errors.language"
            />

            <FormFieldCheckbox
              v-model:checked="values.isDefault"
              name="isDefault"
              :label="$i18n.t('blog:defaultCategory')"
              :error="errors.isDefault"
            />

            <FormField
              v-model:value="values.name"
              name="name"
              :label="$i18n.t('blog:name')"
              :error="errors.name"
            />

            <FormFieldSelect
              v-if="!isLangSpecific || values.language"
              v-model:value="values.parent"
              name="parentCategory"
              :label="$i18n.t('blog:parentCategory')"
              :options="parentCategoryOptionList"
              :error="errors.parent"
            />

            <FormFieldUrlAliasInput
              id="urlAlias"
              v-model:value="values.urlAlias"
              name="urlAlias"
              :label="$i18n.t('blog:link')"
              :url-template="pagePath"
              :error="errors.urlAlias"
            />
          </template>

          <template v-if="selectedTabId === 'seo'">
            <SeoFieldGroup
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

    <template #footer>
      <FormFooter
        :back-href="categoryListUrl"
        :is-submitting="isSubmitting"
        :is-creation="isCreation"
        :can-create-another="isCreation"
        @submit="submitForm"
      />
    </template>
  </Page>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import {
  convertRequestErrorToMap,
  getWebsiteOrigin,
  navigateBack,
  Nullable,
  urlTranslit,
  useI18n,
  useToast,
} from '@tager/admin-services';
import {
  OptionType,
  FormFooter,
  TagerFormSubmitEvent,
  SeoChangeEvent,
  TabType,
  FormFieldSelect,
  FormField,
  FormFieldUrlAliasInput,
  FormFieldCheckbox,
  SeoFieldGroup,
} from '@tager/admin-ui';
import { Page } from '@tager/admin-layout';

import {
  useFetchCategories,
  useFetchCategory,
  useFetchModuleConfig,
} from '../../../hooks';
import {
  getBlogCategoryFormUrl,
  getBlogCategoryListUrl,
} from '../../../utils/paths';
import { CategoryFormValues, Language } from '../../../typings/model';
import { createCategory, updateCategory } from '../../../services/requests';
import TabList from '../../Posts/PostForm/components/TabList/TabList.vue';

import {
  convertCategoryFormValuesToPayload,
  convertCategoryListToOptions,
  convertCategoryToFormValues,
} from './CategoryForm.helpers';

export default defineComponent({
  name: 'CategoryForm',
  components: {
    Page,
    SeoFieldGroup,
    FormFieldCheckbox,
    TabList,
    FormFieldUrlAliasInput,
    FormField,
    FormFieldSelect,
    FormFooter,
  },
  setup() {
    const { t } = useI18n();
    const router = useRouter();
    const route = useRoute();
    const toast = useToast();

    const categoryId = computed<string>(
      () => route.params.categoryId as string
    );
    const isCreation = computed<boolean>(() => categoryId.value === 'create');

    /** Fetch module config */

    const { data: moduleConfig, loading: isModuleConfigLoading } =
      useFetchModuleConfig();

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

    const { data: categories, loading: isCategoriesLoading } =
      useFetchCategories();

    /** Fetch Category */

    const { data: category, loading: isCategoryLoading } = useFetchCategory({
      categoryId,
      isCreation,
    });

    /** Form State */
    const isSubmitting = ref<boolean>(false);
    const values = ref<CategoryFormValues>(
      convertCategoryToFormValues(category.value, languageOptionList.value, t)
    );
    const errors = ref<Record<string, string>>({});

    watch([category, languageOptionList], () => {
      values.value = convertCategoryToFormValues(
        category.value,
        languageOptionList.value,
        t
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
            router.push(
              getBlogCategoryFormUrl({ categoryId: String(data.id) })
            );
          }

          if (event.type === 'create_exit' || event.type === 'save_exit') {
            navigateBack(router, getBlogCategoryListUrl());
          }

          if (event.type === 'create_create-another') {
            values.value = convertCategoryToFormValues(
              null,
              languageOptionList.value,
              t
            );
          }

          toast.show({
            variant: 'success',
            title: t('blog:success'),
            body: isCreation.value
              ? t('blog:blogCategoryWasSuccessfullyCreated')
              : t('blog:blogCategoryWasSuccessfullyUpdated'),
          });
        })
        .catch((error) => {
          console.error(error);
          errors.value = convertRequestErrorToMap(error);
          toast.show({
            variant: 'danger',
            title: t('blog:error'),
            body: isCreation.value
              ? t('blog:blogCategoryCreationWasFailed')
              : t('blog:blogCategoryUpdateWasFailed'),
          });
        })
        .finally(() => {
          isSubmitting.value = false;
        });
    }

    /** Category Options */

    const parentCategoryOptionList = computed<OptionType<Nullable<number>>[]>(
      () =>
        convertCategoryListToOptions(
          categories.value,
          values.value.language?.value ?? null,
          t
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

    /** Url Alias **/

    const urlAliasChanged = ref<boolean>(false);

    const handleNameChange = (value: string) => {
      if (isCreation.value && !urlAliasChanged.value) {
        values.value.urlAlias = urlTranslit(value);
      }
    };

    const handleAliasChange = () => {
      urlAliasChanged.value = true;
    };

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
      parentCategoryOptionList,
      handleNameChange,
      handleAliasChange,

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
