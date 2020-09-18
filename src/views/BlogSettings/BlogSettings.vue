<template>
  <page
    title="Blog settings"
    :is-content-loading="isContentLoading"
    :footer="{
      backHref: '/',
      onSubmit: submitForm,
      isSubmitting: isSubmitting,
    }"
  >
    <template v-slot:content>
      <form novalidate @submit.prevent="submitForm">
        <DynamicField
          v-for="field of values"
          :key="field.config.name"
          :field="field"
        />
      </form>
    </template>
  </page>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch } from '@vue/composition-api';
import { convertRequestErrorToMap, useResource } from '@tager/admin-services';
import { DynamicField } from '@tager/admin-dynamic-field';

import { SettingItemType } from '../../typings/model';
import {
  getBlogSettingList,
  updateBlogSettingList,
} from '../../services/requests';

import { getBlogPostListUrl } from '../../constants/paths';

import {
  convertBlogSettingsToFormValues,
  SettingsFormValues,
  convertSettingValuesToRequestPayload,
} from './BlogSettings.helpers';

export default defineComponent({
  name: 'BlogSettings',
  components: { DynamicField },
  setup(props, context) {
    const [fetchSettingList, { data: settingList, loading }] = useResource<
      Array<SettingItemType>
    >({
      fetchResource: getBlogSettingList,
      initialValue: [],
      context,
      resourceName: 'Settings',
    });

    onMounted(() => {
      fetchSettingList();
    });

    const isSubmitting = ref<boolean>(false);
    const values = ref<SettingsFormValues>(
      convertBlogSettingsToFormValues(settingList.value)
    );

    watch(settingList, () => {
      values.value = convertBlogSettingsToFormValues(settingList.value);
    });

    const errors = ref<Record<string, string>>({});

    function submitForm() {
      isSubmitting.value = true;

      const body = convertSettingValuesToRequestPayload(values.value);

      updateBlogSettingList(body)
        .then(() => {
          errors.value = {};
          context.root.$router.push(getBlogPostListUrl());

          context.root.$toast({
            variant: 'success',
            title: 'Success',
            body: `Blog settings have been successfully updated`,
          });
        })
        .catch((error) => {
          console.error(error);
          errors.value = convertRequestErrorToMap(error);
          context.root.$toast({
            variant: 'danger',
            title: 'Error',
            body: `Blog settings update has been failed`,
          });
        })
        .finally(() => {
          isSubmitting.value = false;
        });
    }

    return { isContentLoading: loading, submitForm, isSubmitting, values };
  },
});
</script>

<style scoped lang="scss"></style>
