<template>
  <page
    :title="isCreation ? 'Create Blog category' : 'Update Blog category'"
    :is-content-loading="isContentLoading"
  >
    <template v-slot:content>
      <form novalidate @submit.prevent="submitForm">
        <form-field
          v-model="values.name"
          name="name"
          label="Name"
          :error="errors.name"
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
            @click="goBackToCategoryList"
          >
            Back to categories
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

import {
  BlogCategoryCreationPayload,
  BlogCategoryUpdatePayload,
  createBlogCategory,
  getBlogCategory,
  updateBlogCategory,
} from '../../services/requests';
import { BlogCategory } from '../../typings/model';
import { getBlogCategoryListUrl } from '../../constants/paths';

type FormValues = {
  name: string;
  pageTitle: string;
  pageDescription: string;
  openGraphImage: Nullable<FileType>;
  urlAlias: string;
};

export default Vue.extend({
  name: 'BlogCategoryForm',
  data(): {
    values: FormValues;
    errors: Record<string, string>;
    isContentLoading: boolean;
  } {
    return {
      values: {
        name: '',
        pageTitle: '',
        pageDescription: '',
        openGraphImage: null,
        urlAlias: '',
      },
      errors: {},
      isContentLoading: false,
    };
  },
  computed: {
    categoryId(): string {
      return this.$route.params.categoryId;
    },
    isCreation(): boolean {
      return this.categoryId === 'create';
    },
    pagePath(): string {
      return window.location.origin + '/blog/category/';
    },
  },
  mounted(): void {
    if (!this.isCreation) {
      this.isContentLoading = true;

      getBlogCategory(this.categoryId)
        .then((response) => {
          this.values = this.convertReviewToInitialValues(response.data);
        })
        .catch(console.error)
        .finally(() => {
          this.isContentLoading = false;
        });
    }
  },
  methods: {
    convertReviewToInitialValues(category: BlogCategory): FormValues {
      return {
        name: category.name,
        pageTitle: category.pageTitle ?? '',
        pageDescription: category.pageDescription ?? '',
        openGraphImage: category.openGraphImage,
        urlAlias: category.urlAlias,
      };
    },
    submitForm() {
      console.log('Submit form', this.values);
      const creationBody: BlogCategoryCreationPayload = {
        name: this.values.name,
        pageTitle: this.values.pageTitle,
        pageDescription: this.values.pageDescription,
        openGraphImage: this.values.openGraphImage?.id ?? null,
      };

      const updateBody: BlogCategoryUpdatePayload = {
        ...creationBody,
        urlAlias: this.values.urlAlias,
      };

      const requestPromise = this.isCreation
        ? createBlogCategory(creationBody)
        : updateBlogCategory(this.categoryId, updateBody);

      requestPromise
        .then(() => {
          this.errors = {};
          this.$router.push(getBlogCategoryListUrl());

          this.$toast({
            variant: 'success',
            title: 'Success',
            body: `Blog category was successfully ${
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
            body: `Blog category ${
              this.isCreation ? 'creation' : 'update'
            } was failed`,
          });
        });
    },
    goBackToCategoryList() {
      this.$router.push(getBlogCategoryListUrl());
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
