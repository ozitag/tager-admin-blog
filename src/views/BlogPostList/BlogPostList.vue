<template>
  <page
    :title="pageTitle"
    :header-buttons="[
      {
        text: $t('blog:newPost'),
        href: getBlogPostFormUrl({ postId: 'create' }),
      },
    ]"
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
        data-table="blog-post"
        @change="handleChange"
      >
        <template v-slot:cell(actions)="{ row }">
          <base-button
            variant="icon"
            :title="$t('blog:edit')"
            :disabled="isDeleting(row.id)"
            :href="getBlogPostFormUrl({ postId: row.id })"
          >
            <svg-icon name="edit"></svg-icon>
          </base-button>
          <base-button
            variant="icon"
            :title="$t('blog:remove')"
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
import { computed, defineComponent } from '@vue/composition-api';

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
        ? `${context.root.$t('blog:postsByCategory')} "${
            selectedCategory.value.name
          }"`
        : context.root.$t('blog:posts');
    });

    /** Fetch Post list */
    const {
      fetchEntityList: fetchPostList,
      isLoading: isPostLoading,
      rowData: postList,
      errorMessage,
      searchQuery,
      handleChange,
      pageNumber,
      pageCount,
      pageSize,
    } = useDataTable<PostShort>({
      fetchEntityList: (params) =>
        getBlogPostList({
          query: params.searchQuery,
          pageNumber: params.pageNumber,
          pageSize: params.pageSize,
        }),
      initialValue: [],
      context,
      resourceName: 'Blog post list',
      pageSize: 100,
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
      getPostTableColumnDefs(moduleConfig.value, context.root.$t)
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
      pageNumber,
      pageCount,
      pageSize,
    };
  },
});
</script>

<style scoped lang="scss"></style>
