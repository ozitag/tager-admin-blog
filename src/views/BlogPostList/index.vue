<template>
  <page
    :title="pageTitle"
    :header-buttons="[{ text: 'New Post', href: getPostUrl('create') }]"
  >
    <template v-slot:content>
      <base-table
        :column-defs="columnDefs"
        :row-data="displayedRowData"
        :loading="isRowDataLoading"
        :error-message="errorMessage"
      >
        <template v-slot:cell(actions)="{ row }">
          <base-button
            variant="icon"
            title="Edit"
            :disabled="deletingPostIdList.includes(row.id)"
            @click="goToEditPost(row.id)"
          >
            <svg-icon name="edit"></svg-icon>
          </base-button>
          <base-button
            variant="icon"
            title="Remove"
            :disabled="deletingPostIdList.includes(row.id)"
            @click="handlePostDelete(row)"
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
import {
  getImageUrl,
  getMessageFromError,
  Nullable,
} from '@tager/admin-services';

import { BlogCategory, Post } from '../../typings/model';
import {
  deleteBlogPost,
  getBlogCategoryList,
  getBlogPostList,
} from '../../services/requests';
import { getBlogPostFormUrl } from '../../constants/paths';

const COLUMN_DEFS: Array<ColumnDefinition<Post>> = [
  {
    id: 1,
    name: 'ID',
    field: 'id',
    style: { width: '50px', textAlign: 'center' },
    headStyle: { width: '50px', textAlign: 'center' },
  },
  {
    id: 2,
    name: 'Image',
    field: 'coverImage',
    type: 'image',
    format: ({ row }) => getImageUrl(row.coverImage),
  },
  {
    id: 4,
    name: 'Title',
    field: 'title',
    type: 'link',
    shouldUseRouter: true,
    format: ({ row }): LinkCellValue => ({
      href: getBlogPostFormUrl({ postId: row.id }),
      label: row.title,
    }),
  },
  { id: 5, name: 'Date', field: 'date', type: 'date' },
  {
    id: 6,
    name: 'Categories',
    field: 'categories',
    format: ({ row }) =>
      row.categories.map((category) => category.name).join(', '),
  },
  {
    id: 7,
    name: 'Website URL',
    field: 'websiteUrl',
    type: 'link',
    shouldUseRouter: false,
    format: ({ row }): LinkCellValue | string => `/blog/${row.urlAlias}`,
  },
  {
    id: 8,
    name: 'Actions',
    field: 'actions',
    style: { whiteSpace: 'nowrap', width: '120px' },
    headStyle: { whiteSpace: 'nowrap', width: '120px' },
    class: 'actions-cell',
  },
];

export default Vue.extend({
  name: 'BlogPostList',
  data(): {
    columnDefs: Array<ColumnDefinition<Post>>;
    rowData: Array<Post>;
    deletingPostIdList: Array<number>;
    categoryList: Array<BlogCategory>;
    isRowDataLoading: boolean;
    errorMessage: Nullable<string>;
  } {
    return {
      columnDefs: COLUMN_DEFS,
      rowData: [],
      deletingPostIdList: [],
      categoryList: [],
      isRowDataLoading: false,
      errorMessage: null,
    };
  },
  computed: {
    categoryId(): string {
      return Array.isArray(this.$route.query.category)
        ? ''
        : this.$route.query.category;
    },
    pageTitle(): string {
      const foundCategory = this.categoryId
        ? this.categoryList.find(
            (category) => String(category.id) === String(this.categoryId)
          )
        : null;
      return foundCategory
        ? `Posts by category "${foundCategory.name}"`
        : 'Posts';
    },
    displayedRowData(): Array<Post> {
      console.log('this.categoryId', this.categoryId);
      return this.categoryId
        ? this.rowData.filter((post) =>
            post.categories.some(
              (category) => String(category.id) === String(this.categoryId)
            )
          )
        : this.rowData;
    },
  },
  mounted(): void {
    getBlogCategoryList()
      .then((response) => {
        this.categoryList = response.data;
      })
      .catch(console.error);

    this.refreshPostList();
  },
  methods: {
    getPostUrl(postId: string | number): string {
      return getBlogPostFormUrl({ postId });
    },
    refreshPostList(): Promise<void> {
      this.isRowDataLoading = true;

      return getBlogPostList()
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
    handlePostDelete(post: Post) {
      const shouldDeletePost = confirm(
        `Are you sure you want to delete post "${post.title}"`
      );

      if (shouldDeletePost) {
        this.deletingPostIdList.push(post.id);
        deleteBlogPost(post.id)
          .then((response) => {
            if (response.success) {
              this.refreshPostList().then(() => {
                this.deletingPostIdList.filter((id) => id !== post.id);
              });
              this.$toast({
                variant: 'success',
                title: 'Success',
                body: 'Post was successfully removed',
              });
            } else {
              this.$toast({
                variant: 'danger',
                title: 'Error',
                body: 'Post deletion was failed',
              });
            }
          })
          .catch((error) => {
            console.error(error);
            this.$toast({
              variant: 'danger',
              title: 'Error',
              body: 'Post deletion was failed',
            });
          });
      }
    },
    goToEditPost(postId: number) {
      this.$router.push(this.getPostUrl(postId));
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
