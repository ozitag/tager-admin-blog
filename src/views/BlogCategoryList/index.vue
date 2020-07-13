<template>
  <page
    title="Blog Categories"
    :header-buttons="[{ text: 'New Category', href: getCategoryUrl('create') }]"
  >
    <template v-slot:content>
      <base-table
        :column-defs="columnDefs"
        :row-data="rowData"
        :loading="isRowDataLoading"
        :error-message="errorMessage"
      >
        <template v-slot:cell(link-to-posts)="{ row }">
          <base-button
            :href="getLinkToPostsByCategory(row.id)"
            variant="outline-secondary"
          >
            Posts ({{ getPostCountByCategory(row.id) }})
          </base-button>
        </template>

        <template v-slot:cell(actions)="{ row, rowIndex }">
          <base-button
            variant="icon"
            title="Edit"
            :disabled="deletingCategoryIdList.includes(row.id)"
            @click="goToEditCategory(row.id)"
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
            :disabled="deletingCategoryIdList.includes(row.id)"
            @click="handleCategoryDelete(row)"
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
import { ColumnDefinition, LinkCellValue } from '@tager/admin-ui';
import { compile } from 'path-to-regexp';
import {
  getImageUrl,
  getMessageFromError,
  Nullable,
} from '@tager/admin-services';

import { BlogCategory, Post } from '../../typings/model';
import {
  deleteBlogCategory,
  getBlogCategoryList,
  getBlogPostList,
  moveBlogCategory,
} from '../../services/requests';
import { BLOG_ROUTE_PATHS } from '../../constants/paths';

function getCategoryUrl(categoryId: string | number): string {
  return compile(BLOG_ROUTE_PATHS.CATEGORY_FORM)({
    categoryId,
  });
}

const COLUMN_DEFS: Array<ColumnDefinition<BlogCategory>> = [
  { id: 1, name: 'ID', field: 'id', style: { width: '25px' } },
  {
    id: 2,
    name: 'Name',
    field: 'name',
    type: 'link',
    shouldUseRouter: true,
    format: ({ row }): LinkCellValue => ({
      href: getCategoryUrl(row.id),
      label: row.name,
    }),
  },
  { id: 3, name: 'Url alias', field: 'urlAlias' },
  {
    id: 4,
    name: 'Website URL',
    field: 'websiteUrl',
    type: 'link',
    shouldUseRouter: false,
    format: ({ row }): LinkCellValue | string =>
      `/blog/category/${row.urlAlias}`,
  },

  { id: 5, name: 'Page title', field: 'pageTitle' },
  { id: 6, name: 'Page description', field: 'pageDescription' },
  {
    id: 7,
    name: 'Open Graph image',
    field: 'openGraphImage',
    type: 'image',
    format: ({ row }) => getImageUrl(row.openGraphImage),
  },
  {
    id: 8,
    name: 'Posts',
    field: 'linkToPosts',
    style: { whiteSpace: 'nowrap', textAlign: 'center', width: '130px' },
  },
  {
    id: 9,
    name: 'Actions',
    field: 'actions',
    style: { whiteSpace: 'nowrap', width: '205px' },
    class: 'actions-cell',
  },
];

export default Vue.extend({
  name: 'BlogCategoryList',
  data(): {
    columnDefs: Array<ColumnDefinition<BlogCategory>>;
    rowData: Array<BlogCategory>;
    deletingCategoryIdList: Array<number>;
    postList: Array<Post>;
    isCategoryMoving: boolean;
    isRowDataLoading: boolean;
    errorMessage: Nullable<string>;
  } {
    return {
      columnDefs: COLUMN_DEFS,
      rowData: [],
      deletingCategoryIdList: [],
      isCategoryMoving: false,
      postList: [],
      isRowDataLoading: false,
      errorMessage: null,
    };
  },
  mounted(): void {
    this.refreshCategoryList();

    getBlogPostList()
      .then((response) => {
        this.postList = response.data;
      })
      .catch(console.error);
  },
  methods: {
    getCategoryUrl,
    refreshCategoryList(): Promise<void> {
      this.isRowDataLoading = true;
      return getBlogCategoryList()
        .then((response) => {
          this.rowData = response.data;
          this.errorMessage = null;
        })
        .catch((error) => {
          console.error(error);
          this.rowData = [];
          this.errorMessage = getMessageFromError(error);
        })
        .finally(() => {
          this.isRowDataLoading = false;
        });
    },
    moveCategory(categoryId: number, direction: 'up' | 'down') {
      this.isCategoryMoving = true;

      moveBlogCategory(categoryId, direction)
        .then((response) => {
          if (response.success) {
            return this.refreshCategoryList();
          }
        })
        .catch(console.error)
        .finally(() => {
          this.isCategoryMoving = false;
        });
    },
    handleCategoryDelete(category: BlogCategory) {
      const shouldDeleteCategory = confirm(
        `Are you sure you want to delete category "${category.name}"`
      );

      if (shouldDeleteCategory) {
        this.deletingCategoryIdList.push(category.id);
        deleteBlogCategory(category.id)
          .then((response) => {
            if (response.success) {
              this.refreshCategoryList().then(() => {
                this.deletingCategoryIdList.filter((id) => id !== category.id);
              });
              this.$toast({
                variant: 'success',
                title: 'Success',
                body: 'Category was successfully removed',
              });
            } else {
              this.$toast({
                variant: 'danger',
                title: 'Error',
                body: 'Category deletion was failed',
              });
            }
          })
          .catch((error) => {
            console.error(error);
            this.$toast({
              variant: 'danger',
              title: 'Error',
              body: 'Category deletion was failed',
            });
          });
      }
    },
    getPostCountByCategory(categoryId: number) {
      return this.postList.reduce((sum, post) => {
        return post.categories.some((category) => category.id === categoryId)
          ? sum + 1
          : sum;
      }, 0);
    },
    getLinkToPostsByCategory(categoryId: number) {
      return `${BLOG_ROUTE_PATHS.POST_LIST}?category=${categoryId}`;
    },
    getLinkToCategoryForm(categoryId: number) {
      return this.getCategoryUrl(categoryId);
    },
    goToEditCategory(categoryId: number): void {
      this.$router.push(this.getCategoryUrl(categoryId));
    },
  },
});
</script>

<style scoped lang="scss">
.actions-cell {
  button:not(:last-child) {
    margin-right: 0.5rem;
  }
}
</style>
