<template>
  <Page
    :title="$i18n.t('blog:blogCategories')"
    :header-buttons="[
      {
        text: $i18n.t('blog:newCategory'),
        href: getBlogCategoryFormUrl({ categoryId: 'create' }),
      },
    ]"
  >
    <template #content>
      <DataTable
        :column-defs="columnDefs"
        :row-data="rowData"
        :loading="isRowDataLoading"
        :error-message="errorMessage"
        :search-query="searchQuery"
        :pagination="{
          pageNumber,
          pageCount,
          pageSize,
          disabled: isRowDataLoading,
        }"
        data-table="blog-category"
        @change="handleChange"
      >
        <template v-if="isLangSpecific" #filters>
          <AdvancedSearch :tags="tags" @click:tag="tagRemovalHandler">
            <div class="filters">
              <FormFieldMultiSelect
                v-model:values="languageFilter"
                :options="languageOptionList"
                name="languageFilter"
                :searchable="true"
                :label="$i18n.t('blog:language')"
                class="filter"
              />
            </div>
          </AdvancedSearch>
        </template>

        <template #cell(link-to-posts)="{ row }">
          <CountButton
            :href="getLinkToPostsByCategory(row.id)"
            variant="outline-secondary"
            :count="row.postsCount"
          >
            {{ $i18n.t('blog:posts') }}
          </CountButton>
        </template>

        <template #cell(actions)="{ row, rowIndex }">
          <BaseButton
            variant="icon"
            :title="$i18n.t('blog:edit')"
            :disabled="isDeleting(row.id)"
            :href="getBlogCategoryFormUrl({ categoryId: row.id })"
          >
            <EditIcon />
          </BaseButton>

          <BaseButton
            variant="icon"
            :title="$i18n.t('blog:moveUp')"
            :disabled="rowIndex === 0 || isCategoryMoving"
            @click="startMoveCategory(row.id, 'up')"
          >
            <NorthIcon />
          </BaseButton>

          <BaseButton
            variant="icon"
            :title="$i18n.t('blog:moveDown')"
            :disabled="rowIndex === rowData.length - 1 || isCategoryMoving"
            @click="startMoveCategory(row.id, 'down')"
          >
            <SouthIcon />
          </BaseButton>

          <BaseButton
            variant="icon"
            :title="$i18n.t('blog:remove')"
            :disabled="isDeleting(row.id) || row.postsCount > 0"
            @click="handleCategoryDelete(row.id)"
          >
            <DeleteIcon />
          </BaseButton>
        </template>
      </DataTable>
    </template>
  </Page>
</template>

<script lang="ts">
import { computed, ref, defineComponent, watch } from 'vue';
import isEqual from 'lodash.isequal';
import { useRoute, useRouter } from 'vue-router';

import { useI18n, useResourceDelete } from '@tager/admin-services';
import {
  AdvancedSearch,
  BaseButton,
  CountButton,
  DeleteIcon,
  EditIcon,
  FormFieldMultiSelect,
  NorthIcon,
  SouthIcon,
  useDataTable,
  DataTable,
} from '@tager/admin-ui';
import { Page } from '@tager/admin-layout';

import { useFetchModuleConfig } from '../../../hooks';
import { getBlogCategoryFormUrl } from '../../../utils/paths';
import {
  deleteCategory,
  getCategories,
  moveCategory,
} from '../../../services/requests';
import { Category, Language } from '../../../typings/model';
import { BLOG_ROUTE_PATHS } from '../../../constants/paths';

import {
  convertCategoryList,
  getCategoryTableColumnDefs,
  getLinkToPostsByCategory,
} from './CategoryList.helpers';
import { useAdvancedSearch } from './hooks';

export default defineComponent({
  name: 'BlogCategoryList',
  components: {
    DeleteIcon,
    SouthIcon,
    NorthIcon,
    EditIcon,
    BaseButton,
    CountButton,
    FormFieldMultiSelect,
    AdvancedSearch,
    Page,
    DataTable,
  },
  setup() {
    const { t } = useI18n();
    const route = useRoute();
    const router = useRouter();

    /** Fetch module config **/

    const { data: moduleConfig, loading: isModuleConfigLoading } =
      useFetchModuleConfig();

    const languageList = computed<Language[]>(
      () => moduleConfig.value?.languages ?? []
    );

    /** Advanced search **/

    const {
      languageFilter,
      languageOptionList,
      filterParams,
      tags,
      tagRemovalHandler,
    } = useAdvancedSearch({ languageList, route, t });

    const isLangSpecific = computed<boolean>(
      () => languageOptionList.value.length > 1
    );

    /** Fetch category list */

    const {
      fetchEntityList: fetchCategoryList,
      isLoading: isCategoryListLoading,
      rowData: categoryList,
      errorMessage,
      searchQuery,
      handleChange,
      pageNumber,
      pageCount,
      pageSize,
    } = useDataTable<Category>({
      fetchEntityList: (params) =>
        getCategories({
          query: params.searchQuery,
          pageNumber: params.pageNumber,
          pageSize: params.pageSize,
          ...filterParams.value,
        }),
      initialValue: [],
      resourceName: 'Blog categories',
      pageSize: 100,
    });

    watch(filterParams, () => {
      if (isModuleConfigLoading.value || isCategoryListLoading.value) {
        return;
      }

      if (route.path !== BLOG_ROUTE_PATHS.CATEGORY_LIST) {
        return;
      }

      const newQuery = {
        ...filterParams.value,
        query: (route.query.query ?? '') as string,
      };

      if (!isEqual(route.query, newQuery)) {
        router.replace({ query: newQuery });
        fetchCategoryList();
      }
    });

    const { isDeleting, handleResourceDelete: handleCategoryDelete } =
      useResourceDelete({
        deleteResource: deleteCategory,
        resourceName: 'Post',
        onSuccess: fetchCategoryList,
      });

    const isCategoryMoving = ref<boolean>(false);

    function startMoveCategory(categoryId: number, direction: 'up' | 'down') {
      isCategoryMoving.value = true;

      moveCategory(categoryId, direction)
        .then((response) => {
          if (response.success) {
            return fetchCategoryList();
          }
        })
        .catch(console.error)
        .finally(() => {
          isCategoryMoving.value = false;
        });
    }

    /** Misc */

    const isRowDataLoading = computed<boolean>(
      () => isCategoryListLoading.value || isModuleConfigLoading.value
    );

    const displayedCategoryList = computed<Category[]>(() =>
      convertCategoryList(categoryList.value, languageList.value)
    );

    const columnDefs = computed(() =>
      getCategoryTableColumnDefs(moduleConfig.value, t)
    );

    return {
      columnDefs,
      rowData: displayedCategoryList,
      isRowDataLoading,
      errorMessage,
      isLangSpecific,
      handleCategoryDelete,
      isDeleting,
      getBlogCategoryFormUrl,
      getLinkToPostsByCategory,
      startMoveCategory,
      isCategoryMoving,

      searchQuery,
      handleChange,
      pageNumber,
      pageCount,
      pageSize,

      languageFilter,
      languageOptionList,
      tags,
      tagRemovalHandler,
    };
  },
});
</script>
