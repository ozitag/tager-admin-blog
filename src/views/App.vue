<template>
  <page-layout :sidebar-menu-list="sidebarMenuList">
    <router-view />
  </page-layout>
</template>

<script lang="ts">
import { defineComponent, SetupContext } from '@vue/composition-api';

import { getBlogMenuItem } from '../constants/menu';

export default defineComponent({
  name: 'App',
  setup(props, context: SetupContext) {
    const blogMenuItem = getBlogMenuItem({ t: context.root.$t });

    return {
      sidebarMenuList: [blogMenuItem],
    };
  },
});
</script>
