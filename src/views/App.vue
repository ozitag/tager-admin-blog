<template>
  <page-layout :sidebar-menu-list="sidebarMenuList">
    <router-view />
  </page-layout>
</template>

<script lang="ts">
import Vue from 'vue';

import { BLOG_MENU_ITEM } from '@/constants/menu';

export default Vue.extend({
  name: 'App',
  data() {
    return {
      sidebarMenuList: [BLOG_MENU_ITEM],
    };
  },
});
</script>

<style scoped lang="scss"></style>
