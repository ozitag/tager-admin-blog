<template>
  <page
    title="Blog Categories"
    :header-buttons="[
      {
        text: 'New Category',
        href: getBlogCategoryFormUrl({ categoryId: 'create' }),
      },
    ]"
  >
    <template v-slot:content>
      <base-table
        :column-defs="columnDefs"
        :row-data="rowData"
        :loading="isRowDataLoading"
        :error-message="errorMessage"
        data-table="blog-category"
      >
        <template v-slot:cell(link-to-posts)="{ row }">
          <count-button
            :href="getLinkToPostsByCategory(row.id)"
            variant="outline-secondary"
            :count="row.postsCount"
          >
            Posts
          </count-button>
        </template>

        <template v-slot:cell(actions)="{ row, rowIndex }">
          <base-button
            variant="icon"
            title="Edit"
            :disabled="isDeleting(row.id)"
            :href="getBlogCategoryFormUrl({ categoryId: row.id })"
          >
            <svg-icon name="edit"></svg-icon>
          </base-button>

          <base-button
            variant="icon"
            title="Move up"
            :disabled="rowIndex === 0 || isCategoryMoving"
            @click="moveCategory(row.id, 'up')"
          >
            <svg-icon name="north"></svg-icon>
          </base-button>

          <base-button
            variant="icon"
            title="Move down"
            :disabled="rowIndex === rowData.length - 1 || isCategoryMoving"
            @click="moveCategory(row.id, 'down')"
          >
            <svg-icon name="south"></svg-icon>
          </base-button>

          <base-button
            variant="icon"
            title="Remove"
            :disabled="isDeleting(row.id) || row.postsCount > 0"
            @click="handleCategoryDelete(row.id)"
          >
            <svg-icon name="delete"></svg-icon>
          </base-button>
        </template>
      </base-table>
    </template>
  </page>
</template>

<script lang="ts">
import Vue from 'vue';
import { computed, onMounted, ref } from '@vue/composition-api';

import { useResource, useResourceDelete } from '@tager/admin-services';
import { OptionType } from '@tager/admin-ui';

import { BlogCategory } from '../../typings/model';
import {
  deleteBlogCategory,
  getBlogCategoryList,
  moveBlogCategory,
} from '../../services/requests';
import {
  getBlogCategoryFormUrl,
  getBlogPostListUrl,
} from '../../constants/paths';
import useModuleConfig from '../../hooks/useModuleConfig';

import {
  convertCategoryList,
  getCategoryTableColumnDefs,
} from './BlogCategoryList.helpers';

export default Vue.extend({
  name: 'BlogCategoryList',
  setup(props, context) {
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

    const [
      fetchBlogCategoryList,
      { data: categoryList, loading: isCategoryListLoading, error },
    ] = useResource<Array<BlogCategory>>({
      fetchResource: getBlogCategoryList,
      initialValue: [],
      context,
      resourceName: 'Blog category list',
    });

    onMounted(() => {
      fetchBlogCategoryList();
    });

    const {
      handleResourceDelete: handleCategoryDelete,
      isDeleting,
    } = useResourceDelete({
      deleteResource: deleteBlogCategory,
      resourceName: 'Post',
      onSuccess: fetchBlogCategoryList,
      context,
    });

    const isCategoryMoving = ref<boolean>(false);

    function moveCategory(categoryId: number, direction: 'up' | 'down') {
      isCategoryMoving.value = true;

      moveBlogCategory(categoryId, direction)
        .then((response) => {
          if (response.success) {
            return fetchBlogCategoryList();
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

    function getLinkToPostsByCategory(categoryId: number): string {
      return `${getBlogPostListUrl()}?category=${categoryId}`;
    }

    const displayedCategoryList = computed<Array<BlogCategory>>(() =>
      convertCategoryList(
        categoryList.value,
        moduleConfig.value?.languages ?? []
      )
    );

    const columnDefs = computed(() =>
      getCategoryTableColumnDefs(moduleConfig.value)
    );

    return {
      columnDefs,
      rowData: displayedCategoryList,
      isRowDataLoading,
      errorMessage: error,
      isLangSpecific,
      languageOptionList,
      handleCategoryDelete,
      isDeleting,
      getBlogCategoryFormUrl,
      getLinkToPostsByCategory,
      moveCategory,
      isCategoryMoving,
    };
  },
});
</script>

<style scoped lang="scss"></style>
