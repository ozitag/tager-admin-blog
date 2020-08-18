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
      <form novalidate @submit.prevent="submitForm"></form>
    </template>
  </page>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from '@vue/composition-api';
import useResource from '../../hooks/useResource';
import { SettingsItemType } from '../../typings/model';
import { getBlogSettingList } from '../../services/requests';

export default defineComponent({
  name: 'BlogSettings',
  setup(props, context) {
    const [fetchSettingList, { data: settingList, loading }] = useResource<
      Array<SettingsItemType>
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
    const values = ref<Array<SettingsItemType>>(settingList.value);
    const errors = ref<Record<string, string>>({});

    function submitForm() {
      isSubmitting.value = true;
    }

    return { isContentLoading: loading, submitForm, isSubmitting, values };
  },
});
</script>

<style scoped lang="scss"></style>
