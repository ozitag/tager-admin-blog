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
      >
        <template v-slot:cell(title)="{ row }">
          <router-link :to="getLinkToPostForm(row.id)">
            {{ row.title }}
          </router-link>
        </template>

        <template v-slot:cell(website-url)="{ row }">
          <a :href="row.websiteUrl" target="_blank">
            {{ row.websiteUrl }}
          </a>
        </template>

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
import { compile } from 'path-to-regexp';
import { ColumnDefinition } from '@tager/admin-ui';
import { getImageUrl } from '@tager/admin-services';

import { BlogCategory, Post } from '../../typings/model';
import {
  deleteBlogPost,
  getBlogCategoryList,
  getBlogPostList,
} from '../../services/requests';
import { BLOG_ROUTE_PATHS } from '../../constants/paths';

const COLUMN_DEFS: Array<ColumnDefinition<Post>> = [
  {
    id: 1,
    name: 'ID',
    field: 'id',
  },
  {
    id: 2,
    name: 'Image',
    field: 'coverImage',
    type: 'image',
    format: ({ row }) => getImageUrl(row.coverImage),
  },
  { id: 4, name: 'Title', field: 'title', class: 'link-cell' },
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
    class: 'link-cell',
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
  name: 'BlogPostList',
  data(): {
    columnDefs: Array<ColumnDefinition<Post>>;
    rowData: Array<Post>;
    deletingPostIdList: Array<number>;
    categoryList: Array<BlogCategory>;
    isRowDataLoading: boolean;
  } {
    return {
      columnDefs: COLUMN_DEFS,
      rowData: [],
      deletingPostIdList: [],
      categoryList: [],
      isRowDataLoading: false,
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
      return compile(BLOG_ROUTE_PATHS.POST_FORM)({
        postId,
      });
    },
    refreshPostList(): Promise<void> {
      this.isRowDataLoading = true;

      return getBlogPostList()
        .then((response) => {
          this.rowData = response.data;
        })
        .catch(console.error)
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
    getLinkToPostForm(postId: number) {
      return this.getPostUrl(postId);
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

.link-cell {
  a {
    color: #007bff;

    &:hover {
      color: #0056b3;
      text-decoration: underline;
    }
  }
}
</style>
