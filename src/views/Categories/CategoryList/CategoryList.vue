<template>
  <page
    :title="$t('blog:blogCategories')"
    :header-buttons="
      [
        canViewAdministrators
          ? {
              text: $t('blog:newCategory'),
              href: getBlogCategoryFormUrl({ categoryId: 'create' }),
            }
          : null,
      ].filter(Boolean)
    "
  >
    <template v-slot:content>
      <data-table
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
        <template v-if="isLangSpecific" v-slot:filters>
          <advanced-search :tags="tags" @click:tag="tagRemovalHandler">
            <div class="filters">
              <form-field-multi-select
                v-model="languageFilter"
                :options="languageOptionList"
                name="languageFilter"
                :searchable="true"
                :label="$t('blog:language')"
                class="filter"
              />
            </div>
          </advanced-search>
        </template>

        <template v-slot:cell(link-to-posts)="{ row }">
          <count-button
            :href="getLinkToPostsByCategory(row.id)"
            variant="outline-secondary"
            :count="row.postsCount"
          >
            {{ $t('blog:posts') }}
          </count-button>
        </template>

        <template v-slot:cell(actions)="{ row, rowIndex }">
          <base-button
            variant="icon"
            :title="$t('blog:edit')"
            :disabled="isDeleting(row.id)"
            :href="getBlogCategoryFormUrl({ categoryId: row.id })"
          >
            <svg-icon name="edit" />
          </base-button>

          <base-button
            variant="icon"
            :title="$t('blog:moveUp')"
            :disabled="rowIndex === 0 || isCategoryMoving"
            @click="startMoveCategory(row.id, 'up')"
          >
            <svg-icon name="north" />
          </base-button>

          <base-button
            variant="icon"
            :title="$t('blog:moveDown')"
            :disabled="rowIndex === rowData.length - 1 || isCategoryMoving"
            @click="startMoveCategory(row.id, 'down')"
          >
            <svg-icon name="south" />
          </base-button>

          <base-button
            variant="icon"
            :title="$t('blog:remove')"
            :disabled="isDeleting(row.id) || row.postsCount > 0"
            @click="handleCategoryDelete(row.id)"
          >
            <svg-icon name="delete" />
          </base-button>
        </template>
      </data-table>
    </template>
  </page>
</template>

<script lang="ts">
import { computed, ref, defineComponent, watch } from '@vue/composition-api';
import isEqual from 'lodash.isequal';

import { useResourceDelete } from '@tager/admin-services';
import { useDataTable } from '@tager/admin-ui';

import { Scope } from '@/constants/scopes';
import { Category, Language } from '@/typings/model';
import {
  deleteCategory,
  getCategories,
  moveCategory,
} from '@/services/requests';
import { getBlogCategoryFormUrl } from '@/constants/paths';
import { useFetchModuleConfig, useUserPermission } from '@/hooks';

import {
  convertCategoryList,
  getCategoryTableColumnDefs,
  getLinkToPostsByCategory,
} from './CategoryList.helpers';
import { useAdvancedSearch } from './hooks';

export default defineComponent({
  name: 'BlogCategoryList',
  setup(props, context) {
    const canViewAdministrators = useUserPermission(
      context,
      Scope.AdministratorsView
    );

    /** Fetch module config **/

    const {
      data: moduleConfig,
      loading: isModuleConfigLoading,
    } = useFetchModuleConfig({ context });

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
    } = useAdvancedSearch({ context, languageList });

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
      context,
      resourceName: 'Blog categories',
      pageSize: 100,
    });

    watch(filterParams, () => {
      if (isModuleConfigLoading.value || isCategoryListLoading.value) {
        return;
      }

      const newQuery = {
        ...filterParams.value,
        query: (context.root.$route.query.query ?? '') as string,
      };

      if (!isEqual(context.root.$route.query, newQuery)) {
        context.root.$router.replace({ query: newQuery });
        fetchCategoryList();
      }
    });

    const {
      isDeleting,
      handleResourceDelete: handleCategoryDelete,
    } = useResourceDelete({
      deleteResource: deleteCategory,
      resourceName: 'Post',
      onSuccess: fetchCategoryList,
      context,
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
      getCategoryTableColumnDefs(
        moduleConfig.value,
        context.root.$t,
        canViewAdministrators.value
      )
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

      // Permissions
      canViewAdministrators,
    };
  },
});
</script>
