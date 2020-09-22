<template>
  <ul class="tab-list">
    <li
      v-for="tab of tabList"
      :key="tab.id"
      :class="[
        'tab',
        { active: selectedTabId === tab.id, invalid: tab.hasErrors },
      ]"
    >
      <button class="tab-button" type="button" @click="handleTabClick(tab.id)">
        {{ tab.label }} <span v-if="tab.hasErrors">*</span>
      </button>
    </li>
  </ul>
</template>

<script lang="ts">
import Vue from 'vue';

import { TabType } from './TabList.types';

export default Vue.extend({
  name: 'TabList',
  props: {
    tabList: {
      type: Array as () => Array<TabType>,
      required: true,
    },
    selectedTabId: {
      type: String,
      required: true,
    },
  },
  setup(props, context) {
    function handleTabClick(tabId: TabType['id']) {
      if (props.selectedTabId === tabId) return;

      context.emit('tab:update', { tabId });
    }

    return {
      handleTabClick,
    };
  },
});
</script>

<style scoped lang="scss">
.tab-list {
  display: flex;
  border-bottom: 1px solid #eee;
  margin: -1rem -1rem 1.5rem -1rem;
}

.tab {
  display: block;
  border-top: 3px solid transparent;

  margin-bottom: -1px;

  &:not(.active):not(.invalid):hover {
    color: var(--secondary);
  }

  &.active {
    background-color: #fff;
    border-top-color: var(--primary);

    &:not(:first-child) .tab-button {
      border-left-color: #eee;
    }

    .tab-button {
      cursor: default;
      border-right-color: #eee;
    }
  }

  &.invalid {
    color: red;
  }
}

.tab-button {
  padding: 0.7rem 2rem;
  border-right: 1px solid transparent;
  border-left: 1px solid transparent;
  color: inherit;
  font-weight: inherit;
}
</style>
