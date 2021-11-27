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
        <template v-slot:filters>
          <advanced-search :tags="tags" @click:tag="tagRemovalHandler">
            <div class="filters">
              <form-field-multi-select
                v-model="categoryFilter"
                :options="categoryOptionList"
                name="categoryFilter"
                :searchable="true"
                :label="$t('blog:category')"
                class="filter"
              />

              <form-field-multi-select
                v-if="isLangSpecific"
                v-model="languageFilter"
                :options="languageOptionList"
                name="languageFilter"
                :searchable="true"
                :label="$t('blog:language')"
                class="filter"
              />

              <div class="filter">
                <div class="date-label">
                  {{ $t('blog:dateOfPublication') }}
                </div>

                <div class="date-content">
                  <form-field
                    v-model="fromDateFilter"
                    :label="$t('blog:From')"
                    name="fromDateFilter"
                    type="date"
                    :max="toDateFilter"
                  />

                  <form-field
                    v-model="toDateFilter"
                    :label="$t('blog:To')"
                    name="toDateFilter"
                    type="date"
                    :min="fromDateFilter"
                  />
                </div>
              </div>

              <form-field-multi-select
                v-model="statusFilter"
                :options="statusOptionList"
                name="statusFilter"
                :searchable="true"
                :label="$t('blog:status')"
                class="filter"
              />
            </div>
          </advanced-search>
        </template>

        <template v-slot:cell(actions)="{ row }">
          <base-button
            variant="icon"
            :title="$t('blog:edit')"
            :disabled="isBusy(row.id)"
            :href="getBlogPostFormUrl({ postId: row.id })"
          >
            <svg-icon name="edit" />
          </base-button>

          <base-button
            variant="icon"
            :title="$t('blog:clone')"
            :disabled="isBusy(row.id)"
            @click="handleResourceClone(row.id)"
          >
            <svg-icon name="contentCopy" />
          </base-button>

          <base-button
            variant="icon"
            :title="$t('blog:remove')"
            :disabled="isBusy(row.id)"
            @click="handleResourceDelete(row.id)"
          >
            <svg-icon name="delete" />
          </base-button>
        </template>
      </data-table>
    </template>
  </page>
</template>

<script lang="ts">
import { computed, defineComponent, watch } from '@vue/composition-api';
import isEqual from 'lodash.isequal';
import pick from 'lodash.pick';

import {
  ColumnDefinition,
  OptionType,
  useDataTable,
  useTranslation,
} from '@tager/admin-ui';
import {
  Nullable,
  useResourceClone,
  useResourceDelete,
} from '@tager/admin-services';

import { useFetchModuleConfig, useFetchCategories } from '../../../hooks';
import {
  clonePost,
  deleteBlogPost,
  getPosts,
} from '../../../services/requests';
import { getBlogPostFormUrl } from '../../../constants/paths';
import {
  Category,
  Language,
  PostFull,
  PostShort,
} from '../../../typings/model';
import { getStatusOptions } from '../PostForm/PostForm.helpers';

import { convertPostList, getPostTableColumnDefs } from './PostList.helpers';
import { useAdvancedSearch } from './hooks';

export default defineComponent({
  name: 'Posts',
  setup(props, context) {
    const { t } = useTranslation(context);

    const categoryId = computed<string>(() => {
      return Array.isArray(context.root.$route.query.category)
        ? context.root.$route.query.category[0] ?? ''
        : context.root.$route.query.category;
    });

    const statusOptionList = computed<OptionType[]>(() => getStatusOptions(t));

    /** Fetch module config **/

    const {
      data: moduleConfig,
      loading: isModuleConfigLoading,
    } = useFetchModuleConfig({ context });

    const languageList = computed<Language[]>(
      () => moduleConfig.value?.languages ?? []
    );

    /** Fetch category list **/

    const {
      data: categoryList,
      loading: isCategoryListLoading,
    } = useFetchCategories({ context });

    const selectedCategory = computed<Nullable<Category>>(() =>
      categoryId.value
        ? categoryList.value.find(
            ({ id }) => String(id) === String(categoryId.value)
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

    /** Advanced search **/

    const {
      categoryFilter,
      categoryOptionList,
      languageFilter,
      languageOptionList,
      fromDateFilter,
      toDateFilter,
      filterParams,
      tags,
      tagRemovalHandler,
      statusFilter,
    } = useAdvancedSearch({
      context,
      categoryList,
      languageList,
      statusOptionList,
    });

    const isLangSpecific = computed<boolean>(
      () => languageOptionList.value.length > 1
    );

    /** Fetch Post list **/

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
        getPosts({
          query: params.searchQuery,
          pageNumber: params.pageNumber,
          pageSize: params.pageSize,
          ...filterParams.value,
        }),
      initialValue: [],
      context,
      resourceName: 'Blog post list',
      pageSize: 100,
    });

    watch(filterParams, () => {
      if (isModuleConfigLoading.value || isCategoryListLoading.value) {
        return;
      }

      const newQuery = {
        ...pick(context.root.$route.query, ['query', 'pageNumber']),
        ...filterParams.value,
      };

      if (!isEqual(context.root.$route.query, newQuery)) {
        context.root.$router.replace({ query: newQuery });
        fetchPostList();
      }
    });

    const displayedPostList = computed<PostShort[]>(() =>
      convertPostList(
        postList.value,
        selectedCategory.value,
        moduleConfig.value?.languages ?? []
      )
    );

    const isRowDataLoading = computed<boolean>(
      () =>
        isCategoryListLoading.value ||
        isPostLoading.value ||
        isModuleConfigLoading.value
    );

    const { isDeleting, handleResourceDelete } = useResourceDelete({
      deleteResource: deleteBlogPost,
      resourceName: 'Post',
      onSuccess: fetchPostList,
      context,
    });

    const { isCloning, handleResourceClone } = useResourceClone({
      cloneResource: clonePost,
      confirmMessage: t('blog:cloneConfirm'),
      successMessage: t('blog:cloneSuccess'),
      failureMessage: t('blog:cloneFailure'),
      onSuccessRedirectTo: (data: PostFull) => `/blog/posts/${data.id}`,
      context,
    });

    function isBusy(postId: number): boolean {
      return isDeleting(postId) || isCloning(postId) || isRowDataLoading.value;
    }

    const columnDefs = computed<ColumnDefinition<PostShort>[]>(() =>
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

      // Advanced search
      categoryFilter,
      categoryOptionList,
      isLangSpecific,
      languageFilter,
      languageOptionList,
      fromDateFilter,
      toDateFilter,
      statusFilter,
      statusOptionList,
      tags,
      tagRemovalHandler,

      // Clone
      handleResourceClone,
      isBusy,
    };
  },
});
</script>

<style scoped lang="scss">
.filters {
  display: flex;
  margin: 0 -10px;

  &:not(:first-child) {
    margin-top: 10px;
  }

  .filter {
    padding: 10px 10px 0;
    width: 50%;
    margin: 0;
  }
}

.date-label {
  margin-bottom: 0.5rem;
}

.date-content {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  column-gap: 10px;
}
</style>
