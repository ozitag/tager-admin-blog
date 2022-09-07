<template>
  <Page
      :title="pageTitle"
      :header-buttons="[
      {
        text: $i18n.t('blog:newPost'),
        href: getBlogPostFormUrl({ postId: 'create' }),
      },
    ]"
  >
    <template #content>
      <DataTable
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
          :sort="{ options: sortOptions, value: sortValue }"
          data-table="blog-post"
          @change="handleChange"
      >
        <template #filters>
          <AdvancedSearch :tags="tags" @click:tag="tagRemovalHandler">
            <div class="filters">
              <FormFieldMultiSelect
                  v-model:selected-options="categoryFilter"
                  :options="categoryOptionList"
                  name="categoryFilter"
                  :searchable="true"
                  :label="$i18n.t('blog:category')"
                  class="filter"
              />

              <FormFieldMultiSelect
                  v-if="isLangSpecific"
                  v-model:selected-options="languageFilter"
                  :options="languageOptionList"
                  name="languageFilter"
                  :searchable="true"
                  :label="$i18n.t('blog:language')"
                  class="filter"
              />
              <FormFieldMultiSelect
                  v-model:selected-options="statusFilter"
                  :options="statusOptionList"
                  name="statusFilter"
                  :searchable="true"
                  :label="$i18n.t('blog:status')"
                  class="filter"
              />
            </div>

            <div class="filters">
              <FormField
                  v-model:value="fromDateFilter"
                  :label="$i18n.t('blog:dateOfPublicationFrom')"
                  name="fromDateFilter"
                  type="date"
                  :max="toDateFilter"
              />

              <FormField
                  v-model:value="toDateFilter"
                  :label="$i18n.t('blog:dateOfPublicationTo')"
                  name="toDateFilter"
                  type="date"
                  :min="fromDateFilter"
              />
            </div>
          </AdvancedSearch>
        </template>

        <template #cell(status)="{ row }">
          <div class="status">
            <span>{{ getStatuses($i18n.t)[row.status] }}</span>

            <span v-if="row.status === 'PUBLISHED' && row.archiveAt">
              {{ $i18n.t('blog:archiveAtLabel') }}:
              <i>{{ formatDateTime(new Date(row.archiveAt), true) }}</i>
            </span>

            <span v-if="row.status === 'DRAFT' && row.publishAt">
              {{ $i18n.t('blog:publishAtLabel') }}:
              <i>{{ formatDateTime(new Date(row.publishAt), true) }}</i>
            </span>
          </div>
        </template>

        <template #cell(actions)="{ row }">
          <BaseButton
              variant="icon"
              :title="$i18n.t('blog:edit')"
              :disabled="isBusy(row.id)"
              :href="getBlogPostFormUrl({ postId: row.id })"
          >
            <EditIcon/>
          </BaseButton>

          <BaseButton
              variant="icon"
              :title="$i18n.t('blog:clone')"
              :disabled="isBusy(row.id)"
              @click="handleResourceClone(row.id)"
          >
            <ContentCopyIcon/>
          </BaseButton>

          <BaseButton
              variant="icon"
              :title="$i18n.t('blog:remove')"
              :disabled="isBusy(row.id)"
              @click="handleResourceDelete(row.id)"
          >
            <DeleteIcon/>
          </BaseButton>
        </template>
      </DataTable>
    </template>
  </Page>
</template>

<script lang="ts">
import {computed, defineComponent, watch} from 'vue';
import isEqual from 'lodash.isequal';
import pick from 'lodash.pick';
import {useRoute, useRouter} from 'vue-router';

import {
  ColumnDefinition,
  OptionType,
  useDataTable,
  formatDateTime,
  AdvancedSearch,
  FormFieldMultiSelect,
  FormField,
  BaseButton,
  EditIcon,
  ContentCopyIcon,
  DeleteIcon,
  DataTable,
} from '@tager/admin-ui';
import {
  Nullable,
  useI18n,
  useResourceClone,
  useResourceDelete,
} from '@tager/admin-services';
import {Page} from '@tager/admin-layout';

import {useFetchModuleConfig, useFetchCategories} from '../../../hooks';
import {
  clonePost,
  deleteBlogPost,
  getPosts,
} from '../../../services/requests';
import {getBlogPostFormUrl} from '../../../utils/paths';
import {
  Category,
  Language,
  PostFull,
  PostShort,
} from '../../../typings/model';
import {getStatusOptions} from '../PostForm/PostForm.helpers';

import {
  convertPostList,
  getPostTableColumnDefs,
  getPostTableSortOptions,
  getStatuses,
} from './PostList.helpers';
import {useAdvancedSearch} from './hooks';

export default defineComponent({
  name: 'PostList',
  components: {
    DeleteIcon,
    ContentCopyIcon,
    EditIcon,
    BaseButton,
    FormField,
    FormFieldMultiSelect,
    AdvancedSearch,
    Page,
    DataTable,
  },
  setup() {
    const {t} = useI18n();
    const route = useRoute();
    const router = useRouter();

    const categoryId = computed<string>(() => {
      return Array.isArray(route.query.category)
          ? (route.query.category[0] as string) ?? ''
          : (route.query.category as string);
    });

    const statusOptionList = computed<OptionType[]>(() => getStatusOptions(t));

    /** Fetch module config **/

    const {data: moduleConfig, loading: isModuleConfigLoading} =
        useFetchModuleConfig();

    const languageList = computed<Language[]>(
        () => moduleConfig.value?.languages ?? []
    );

    /** Fetch category list **/

    const {data: categoryList, loading: isCategoryListLoading} =
        useFetchCategories();

    const selectedCategory = computed<Nullable<Category>>(() =>
        categoryId.value
            ? categoryList.value.find(
            ({id}) => String(id) === String(categoryId.value)
        ) ?? null
            : null
    );

    const pageTitle = computed<string>(() => {
      return selectedCategory.value
          ? `${t('blog:postsByCategory')} "${selectedCategory.value.name}"`
          : t('blog:posts');
    });

    const isLangSpecific = computed<boolean>(
        () => languageOptionList.value.length > 1
    );

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
      t,
      route,
      categoryList,
      languageList,
      statusOptionList,
    });

    const sortOptions = getPostTableSortOptions(t);

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
      sort,
    } = useDataTable<PostShort>({
      fetchEntityList: (params) =>
          getPosts({
            query: params.searchQuery,
            pageNumber: params.pageNumber,
            pageSize: params.pageSize,
            sort: params.sort || undefined,
            ...filterParams.value,
          }),
      initialValue: [],
      resourceName: 'Blog post list',
      pageSize: 100,
      defaultSort: sortOptions[0].value,
    });

    watch(filterParams, () => {
      if (isModuleConfigLoading.value || isCategoryListLoading.value) {
        return;
      }

      const newQuery = {
        ...pick(route.query, ['query', 'pageNumber', 'sort']),
        ...filterParams.value,
      };

      if (!isEqual(route.query, newQuery)) {
        router.replace({query: newQuery});
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

    const {isDeleting, handleResourceDelete} = useResourceDelete({
      deleteResource: deleteBlogPost,
      resourceName: 'Post',
      onSuccess: fetchPostList,
    });

    const {isCloning, handleResourceClone} = useResourceClone({
      cloneResource: clonePost,
      confirmMessage: t('blog:cloneConfirm'),
      successMessage: t('blog:cloneSuccess'),
      failureMessage: t('blog:cloneFailure'),
      onSuccessRedirectTo: (data: PostFull) => `/blog/posts/${data.id}`,
    });

    function isBusy(postId: number): boolean {
      return isDeleting(postId) || isCloning(postId) || isRowDataLoading.value;
    }

    const columnDefs = computed<ColumnDefinition<PostShort>[]>(() =>
        getPostTableColumnDefs(moduleConfig.value, t)
    );

    return {
      t,
      formatDateTime,
      columnDefs,
      sortOptions,
      sortValue: sort,
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
      getStatuses,

      // Clone
      handleResourceClone,
      isBusy,
    };
  },
});
</script>

<style scoped lang="scss">
.filters {
  margin-bottom: 1rem;
  width: 100%;
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr 1fr;

  &:not(:first-child) {
    margin-top: 1rem;
  }
}

.status {
  span {
    display: block;
  }

  span:nth-child(2) {
    display: block;
    margin-top: 5px;
    font-size: 0.8rem;

    i {
      display: block;
    }
  }
}
</style>
