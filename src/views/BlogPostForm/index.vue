<template>
  <page
    :title="isCreation ? 'Create Blog post' : 'Update Blog post'"
    :is-content-loading="isContentLoading"
  >
    <template v-slot:content>
      <form novalidate @submit.prevent="submitForm">
        <form-field
          v-model="values.title"
          name="title"
          label="Title"
          :error="errors.title"
        />

        <form-field-url-alias-input
          v-if="!isCreation"
          id="urlAlias"
          v-model="values.urlAlias"
          name="urlAlias"
          label="URL alias"
          :url-prefix="pagePath"
          :error="errors.urlAlias"
        />

        <form-field
          v-model="values.excerpt"
          name="excerpt"
          label="Excerpt"
          type="textarea"
          :error="errors.excerpt"
        />

        <form-field-rich-text-input
          v-model="values.body"
          name="body"
          label="Body"
          :error="errors.body"
        />

        <form-field-multi-select
          v-model="values.categories"
          name="categories"
          label="Categories"
          :options="categoryOptionList"
          :error="errors.categories"
        />

        <form-field
          v-model="values.date"
          name="date"
          label="Date"
          type="date"
          :error="errors.date"
        />

        <form-field-file-input
          v-model="values.image"
          name="image"
          label="Image"
          file-type="image"
        />

        <form-field-file-input
          v-model="values.coverImage"
          label="Cover image"
          name="coverImage"
          file-type="image"
        />

        <form-field
          v-model="values.pageTitle"
          name="pageTitle"
          label="Page title"
          :error="errors.pageTitle"
        />

        <form-field
          v-model="values.pageDescription"
          name="pageDescription"
          label="Page description"
          type="textarea"
          :error="errors.pageDescription"
        />

        <form-field-file-input
          v-model="values.openGraphImage"
          label="Open graph image"
          name="openGraphImage"
          file-type="image"
        />

        <div class="bottom">
          <base-button
            class="save-button"
            variant="outline-secondary"
            @click="goBackToPostList"
          >
            Back to posts
          </base-button>

          <base-button
            type="submit"
            class="save-button"
            variant="outline-secondary"
          />
        </div>
      </form>
    </template>
  </page>
</template>

<script lang="ts">
import Vue from 'vue';
import {
  convertRequestErrorToMap,
  FileType,
  Nullable,
} from '@tager/admin-services';
import { OptionType } from '@tager/admin-ui';

import {
  createBlogPost,
  getBlogCategoryList,
  getBlogPost,
  PostCreationPayload,
  PostUpdatePayload,
  updateBlogPost,
} from '../../services/requests';
import { Post } from '../../typings/model';
import { BLOG_ROUTE_PATHS } from '../../constants/paths';

type FormValues = {
  title: string;
  excerpt: string;
  body: string;
  date: string;
  image: Nullable<FileType>;
  coverImage: Nullable<FileType>;
  pageTitle: string;
  pageDescription: string;
  openGraphImage: Nullable<FileType>;
  urlAlias: string;
  categories: Array<OptionType<number>>;
};

const initialValues: FormValues = {
  title: '',
  excerpt: '',
  body: '',
  date: '',
  image: null,
  coverImage: null,
  pageTitle: '',
  pageDescription: '',
  openGraphImage: null,
  urlAlias: '',
  categories: [],
};

export default Vue.extend({
  name: 'BlogPostForm',
  data(): {
    values: FormValues;
    errors: Record<string, string>;
    categoryOptionList: Array<OptionType<number>>;
    isContentLoading: boolean;
  } {
    return {
      values: { ...initialValues },
      errors: {},
      categoryOptionList: [],
      isContentLoading: false,
    };
  },
  computed: {
    postId(): string {
      return this.$route.params.postId;
    },
    isCreation(): boolean {
      return this.postId === 'create';
    },
    pagePath(): string {
      return window.location.origin + '/blog/';
    },
  },
  watch: {
    postId() {
      this.updateValues();
    },
  },
  mounted(): void {
    this.updateValues();

    getBlogCategoryList()
      .then((response) => {
        this.categoryOptionList = response.data.map((category) => ({
          value: category.id,
          label: category.name,
        }));
      })
      .catch(console.error);
  },
  methods: {
    convertReviewToInitialValues(post: Post): FormValues {
      return {
        title: post.title,
        excerpt: post.excerpt,
        body: post.body,
        date: post.date,
        image: post.image,
        coverImage: post.coverImage,
        pageTitle: post.pageTitle ?? '',
        pageDescription: post.pageDescription ?? '',
        openGraphImage: post.openGraphImage,
        urlAlias: post.urlAlias,
        categories: post.categories.map((category) => ({
          value: category.id,
          label: category.name,
        })),
      };
    },
    updateValues() {
      if (this.isCreation) {
        this.values = { ...initialValues };
      } else {
        this.isContentLoading = true;
        getBlogPost(this.postId)
          .then((response) => {
            this.values = this.convertReviewToInitialValues(response.data);
          })
          .catch(console.error)
          .finally(() => {
            this.isContentLoading = false;
          });
      }
    },
    submitForm() {
      console.log('Submit form', this.values);
      const creationBody: PostCreationPayload = {
        title: this.values.title,
        excerpt: this.values.excerpt,
        body: this.values.body,
        date: this.values.date,
        image: this.values.image?.id ?? null,
        coverImage: this.values.coverImage?.id ?? null,
        pageTitle: this.values.pageTitle,
        pageDescription: this.values.pageDescription,
        openGraphImage: this.values.openGraphImage?.id ?? null,
        status: 'PUBLISHED',
        categories: this.values.categories.map((option) => option.value),
      };

      const updateBody: PostUpdatePayload = {
        ...creationBody,
        urlAlias: this.values.urlAlias,
      };

      const requestPromise = this.isCreation
        ? createBlogPost(creationBody)
        : updateBlogPost(this.postId, updateBody);

      requestPromise
        .then(() => {
          this.errors = {};
          this.$router.push(BLOG_ROUTE_PATHS.POST_LIST);

          this.$toast({
            variant: 'success',
            title: 'Success',
            body: `Blog post was successfully ${
              this.isCreation ? 'created' : 'updated'
            }`,
          });
        })
        .catch((error) => {
          console.error(error);
          this.errors = convertRequestErrorToMap(error);
          this.$toast({
            variant: 'danger',
            title: 'Error',
            body: `Blog post ${
              this.isCreation ? 'creation' : 'update'
            } was failed`,
          });
        });
    },
    goBackToPostList() {
      this.$router.push(BLOG_ROUTE_PATHS.POST_LIST);
    },
  },
});
</script>

<style scoped lang="scss">
.bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.save-button {
  min-width: 100px;
}

.alias-field-inner {
  display: flex;
  align-items: center;

  span {
    font-size: 0.9em;
    margin-right: 10px;
  }
}
</style>
