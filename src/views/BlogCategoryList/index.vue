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
      >
        <template v-slot:cell(name)="{ row }">
          <router-link :to="getLinkToCategoryForm(row.id)">
            {{ row.name }}
          </router-link>
        </template>

        <template v-slot:cell(actions)="{ row }">
          <router-link :to="getLinkToPostsByCategory(row.id)">
            Posts ({{ getPostCountByCategory(row.id) }})
          </router-link>

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
import { getImageUrl } from '@tager/admin-services';

import { BlogCategory, Post } from '../../typings/model';
import {
  deleteBlogCategory,
  getBlogCategoryList,
  getBlogPostList,
} from '../../services/requests';
import { BLOG_ROUTE_PATHS } from '../../constants/paths';

const COLUMN_DEFS: Array<ColumnDefinition<BlogCategory>> = [
  { id: 1, name: 'ID', field: 'id' },
  { id: 2, name: 'Name', field: 'name' },
  { id: 3, name: 'Url alias', field: 'urlAlias' },
  {
    id: 4,
    name: 'Website URL',
    field: 'websiteUrl',
    type: 'link',
    format: ({ row }): LinkCellValue => ({
      href: `/blog/category/${row.urlAlias}`,
      label: `/blog/category/${row.urlAlias}`,
    }),
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
    name: 'Actions',
    field: 'actions',
    style: { whiteSpace: 'nowrap' },
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
    isRowDataLoading: boolean;
  } {
    return {
      columnDefs: COLUMN_DEFS,
      rowData: [],
      deletingCategoryIdList: [],
      postList: [],
      isRowDataLoading: false,
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
    getCategoryUrl(categoryId: string | number): string {
      return compile(BLOG_ROUTE_PATHS.CATEGORY_FORM)({
        categoryId,
      });
    },
    refreshCategoryList(): Promise<void> {
      this.isRowDataLoading = true;
      return getBlogCategoryList()
        .then((response) => {
          this.rowData = response.data;
        })
        .catch(console.error)
        .finally(() => {
          this.isRowDataLoading = false;
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
td {
  a {
    color: #007bff;

    &:hover {
      color: #0056b3;
      text-decoration: underline;
    }
  }
}
.actions-cell {
  button:not(:last-child) {
    margin-right: 0.5rem;
  }
}
</style>
