<template>
  <page
    :title="pageTitle"
    :header-buttons="[
      { text: 'New Post', href: getBlogPostFormUrl({ postId: 'create' }) },
    ]"
  >
    <template v-slot:content>
      <data-table
        :column-defs="columnDefs"
        :row-data="rowData"
        :loading="isRowDataLoading"
        :error-message="errorMessage"
        :search-query="searchQuery"
        data-table="blog-post"
        @change="handleChange"
      >
        <template v-slot:cell(actions)="{ row }">
          <base-button
            variant="icon"
            title="Edit"
            :disabled="isDeleting(row.id)"
            :href="getBlogPostFormUrl({ postId: row.id })"
          >
            <svg-icon name="edit"></svg-icon>
          </base-button>
          <base-button
            variant="icon"
            title="Remove"
            :disabled="isDeleting(row.id)"
            @click="handleResourceDelete(row.id)"
          >
            <svg-icon name="delete"></svg-icon>
          </base-button>
        </template>
      </data-table>
    </template>
  </page>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted } from '@vue/composition-api';

import { ColumnDefinition, useDataTable } from '@tager/admin-ui';
import { Nullable, useResourceDelete } from '@tager/admin-services';

import { BlogCategory, PostShort } from '../../typings/model';
import { deleteBlogPost, getBlogPostList } from '../../services/requests';
import { getBlogPostFormUrl } from '../../constants/paths';
import useModuleConfig from '../../hooks/useModuleConfig';
import useBlogCategoryList from '../../hooks/useBlogCategoryList';

import {
  convertPostList,
  getPostTableColumnDefs,
} from './BlogPostList.helpers';

export default defineComponent({
  name: 'BlogPostList',
  setup(props, context) {
    const categoryId = computed<string>(() => {
      return Array.isArray(context.root.$route.query.category)
        ? context.root.$route.query.category[0] ?? ''
        : context.root.$route.query.category;
    });

    /** Fetch module config */
    const {
      data: moduleConfig,
      loading: isModuleConfigLoading,
    } = useModuleConfig({ context });

    /** Fetch category list */
    const {
      data: categoryList,
      loading: isCategoryListLoading,
    } = useBlogCategoryList({ context });

    const selectedCategory = computed<Nullable<BlogCategory>>(() =>
      categoryId.value
        ? categoryList.value.find(
            (category) => String(category.id) === String(categoryId.value)
          ) ?? null
        : null
    );

    const pageTitle = computed<string>(() => {
      return selectedCategory.value
        ? `Posts by category "${selectedCategory.value.name}"`
        : 'Posts';
    });

    /** Fetch Post list */
    const {
      fetchEntityList: fetchPostList,
      isLoading: isPostLoading,
      rowData: postList,
      errorMessage,
      searchQuery,
      handleChange,
    } = useDataTable<PostShort>({
      fetchEntityList: (params) =>
        getBlogPostList({ query: params.searchQuery }),
      initialValue: [],
      context,
      resourceName: 'Blog post list',
    });

    const displayedPostList = computed<Array<PostShort>>(() =>
      convertPostList(
        postList.value,
        selectedCategory.value,
        moduleConfig.value?.languages ?? []
      )
    );

    const { handleResourceDelete, isDeleting } = useResourceDelete({
      deleteResource: deleteBlogPost,
      resourceName: 'Post',
      onSuccess: fetchPostList,
      context,
    });

    const isRowDataLoading = computed<boolean>(
      () =>
        isCategoryListLoading.value ||
        isPostLoading.value ||
        isModuleConfigLoading.value
    );

    const columnDefs = computed<Array<ColumnDefinition<PostShort>>>(() =>
      getPostTableColumnDefs(moduleConfig.value)
    );

    return {
      columnDefs,
      rowData: displayedPostList,
      handleResourceDelete,
      isDeleting,
      categoryList,
      isRowDataLoading,
      errorMessage,
      getBlogPostFormUrl,
      pageTitle,
      searchQuery,
      handleChange,
    };
  },
});
</script>

<style scoped lang="scss"></style>
