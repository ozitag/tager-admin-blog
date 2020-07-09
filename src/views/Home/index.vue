<template>
  <navigation-grid :nav-items="navItemList" />
</template>

<script lang="ts">
import Vue from 'vue';
import { NavigationGridItem } from '@tager/admin-ui';
import {
  BLOG_CATEGORY_LIST_ROUTE,
  BLOG_POST_LIST_ROUTE,
} from '@/constants/routes';

export default Vue.extend({
  name: 'Home',
  data(): {
    blogNavItem: NavigationGridItem;
  } {
    return {
      blogNavItem: {
        name: 'Blog',
        linkList: [
          { href: BLOG_POST_LIST_ROUTE.path, label: 'Posts' },
          { href: BLOG_CATEGORY_LIST_ROUTE.path, label: 'Categories' },
        ],
      },
    };
  },
  computed: {
    navItemList(): Array<NavigationGridItem> {
      return [this.blogNavItem];
    },
  },
});
</script>

<style scoped lang="scss"></style>
