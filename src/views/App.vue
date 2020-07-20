<template>
  <page-layout :sidebar-menu-list="sidebarMenuList">
    <router-view />
  </page-layout>
</template>

<script lang="ts">
import Vue from 'vue';

import { getBlogMenuItem } from '../constants/menu';

export default Vue.extend({
  name: 'App',
  data() {
    const blogMenuItem = getBlogMenuItem({ t: this.$t });
    return {
      sidebarMenuList: [blogMenuItem],
    };
  },
});
</script>

<style scoped lang="scss"></style>
