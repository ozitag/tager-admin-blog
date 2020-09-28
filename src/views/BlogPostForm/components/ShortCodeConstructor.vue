<template>
  <div v-if="shortCodeOptionList.length > 0" class="container">
    <button
      class="title-button"
      :title="isOpen ? 'Hide' : 'Open'"
      type="button"
      @click="toggleOpen"
    >
      <span>Shortcode</span>
      <span class="icon-container">
        <svg-icon :name="isOpen ? 'expandLess' : 'expandMore'" />
      </span>
    </button>

    <div v-show="isOpen" class="fields">
      <div class="result">
        <span class="code">{{ result }}</span>
        <base-button variant="icon" title="Copy" @click="copyShortCode">
          <svg-icon name="contentCopy" />
        </base-button>
      </div>

      <form-field-select
        v-model="selectedShortCode"
        name="shortCode"
        label="Type"
        :options="shortCodeOptionList"
      />

      <form-field
        v-for="field of fields"
        :key="field.name"
        v-model="values[field.name]"
        :label="field.label"
        :name="field.name"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from '@vue/composition-api';

import { OptionType } from '@tager/admin-ui';
import { Nullable } from '@tager/admin-services';

import { ShortCodeItemType, ShortCodeParamType } from '../../../typings/model';

function getShortCodeLabel(shortCode: string): string {
  return shortCode.slice(0, 1).toUpperCase() + shortCode.slice(1);
}

function getInitialFieldValues(
  fields: Array<ShortCodeParamType>
): Record<string, string> {
  return fields.reduce<Record<string, string>>((values, field) => {
    values[field.name] = '';
    return values;
  }, {});
}

type Props = {
  shortCodeConfigList: Array<ShortCodeItemType>;
};

export default defineComponent<Props>({
  name: 'ShortCodeConstructor',
  props: {
    shortCodeConfigList: {
      type: Array,
      required: true,
    },
  },
  setup(props, context) {
    const isOpen = ref<boolean>(false);

    function toggleOpen() {
      isOpen.value = !isOpen.value;
    }

    const shortCodeOptionList = computed<Array<OptionType>>(() =>
      props.shortCodeConfigList.map((config) => ({
        value: config.shortcode,
        label: getShortCodeLabel(config.shortcode),
      }))
    );

    const selectedShortCode = ref<Nullable<OptionType>>(
      shortCodeOptionList.value[0] ?? null
    );

    watch([shortCodeOptionList, selectedShortCode], () => {
      if (shortCodeOptionList.value.length > 0 && !selectedShortCode.value) {
        selectedShortCode.value = shortCodeOptionList.value[0];
      }
    });

    const fields = computed<Array<ShortCodeParamType>>(() => {
      const foundConfig = props.shortCodeConfigList.find(
        (config) => config.shortcode === selectedShortCode.value?.value
      );

      return foundConfig ? foundConfig.params : [];
    });

    const values = ref<Record<string, string>>(
      getInitialFieldValues(fields.value)
    );

    watch(fields, () => {
      values.value = getInitialFieldValues(fields.value);
    });

    const result = computed<string>(() => {
      if (!selectedShortCode.value) return '';

      const attrs = Object.keys(values.value)
        .map((fieldName) => `${fieldName}="${values.value[fieldName]}"`)
        .join(' ');

      return `[${selectedShortCode.value.value} ${attrs}]`;
    });

    function copyShortCode() {
      navigator.clipboard.writeText(result.value).catch(console.error);
    }

    return {
      shortCodeOptionList,
      selectedShortCode,
      fields,
      values,
      copyShortCode,
      result,
      isOpen,
      toggleOpen,
    };
  },
});
</script>

<style scoped lang="scss">
.container {
  margin-bottom: 1rem;
}

.title-button {
  color: inherit;
  display: inline-flex;
  align-items: center;
}

.title {
  font-size: 1.2rem;
}

.result {
  display: inline-flex;
  align-items: center;
  margin-bottom: 0.5rem;
}

.code {
  margin-right: 1rem;
}

.icon-container {
  padding: 0.375rem;
  border-radius: 50%;
  color: var(--secondary);

  &:hover {
    background-color: rgba(0, 0, 0, 0.08);
  }

  svg {
    display: block;
    fill: currentColor;
    transition: fill 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
  }
}

.fields {
  padding-left: 1rem;
  border-left: 1px solid var(--text-color);
}
</style>
