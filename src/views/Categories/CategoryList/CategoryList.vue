<template>
  <page
    :title="$t('blog:blogCategories')"
    :header-buttons="[
      {
        text: $t('blog:newCategory'),
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
            <svg-icon name="edit"></svg-icon>
          </base-button>

          <base-button
            variant="icon"
            :title="$t('blog:moveUp')"
            :disabled="rowIndex === 0 || isCategoryMoving"
            @click="moveCategory(row.id, 'up')"
          >
            <svg-icon name="north"></svg-icon>
          </base-button>

          <base-button
            variant="icon"
            :title="$t('blog:moveDown')"
            :disabled="rowIndex === rowData.length - 1 || isCategoryMoving"
            @click="moveCategory(row.id, 'down')"
          >
            <svg-icon name="south"></svg-icon>
          </base-button>

          <base-button
            variant="icon"
            :title="$t('blog:remove')"
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
import {
  computed,
  onMounted,
  ref,
  defineComponent,
} from '@vue/composition-api';

import { useResource, useResourceDelete } from '@tager/admin-services';
import { OptionType } from '@tager/admin-ui';

import { Category, Language } from '../../../typings/model';
import {
  deleteBlogCategory,
  getBlogCategoryList,
  moveBlogCategory,
} from '../../../services/requests';
import {
  getBlogCategoryFormUrl,
  getBlogPostListUrl,
} from '../../../constants/paths';
import { useModuleConfig } from '../../../hooks';

import {
  convertCategoryList,
  getCategoryTableColumnDefs,
} from './CategoryList.helpers';

export default defineComponent({
  name: 'BlogCategoryList',
  setup(props, context) {
    /** Fetch module config */
    const {
      data: moduleConfig,
      loading: isModuleConfigLoading,
    } = useModuleConfig({ context });

    const languageList = computed<Language[]>(
      () => moduleConfig.value?.languages ?? []
    );

    const languageOptionList = computed<OptionType[]>(() =>
      languageList.value.map(({ id, name }) => ({ value: id, label: name }))
    );

    const isLangSpecific = computed<boolean>(
      () => languageOptionList.value.length > 0
    );

    /** Fetch category list */

    const [
      fetchBlogCategoryList,
      { data: categoryList, loading: isCategoryListLoading, error },
    ] = useResource<Category[]>({
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

    const displayedCategoryList = computed<Category[]>(() =>
      convertCategoryList(categoryList.value, languageList.value)
    );

    const columnDefs = computed(() =>
      getCategoryTableColumnDefs(moduleConfig.value, context.root.$t)
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
