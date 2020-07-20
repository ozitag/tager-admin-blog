<template>
  <navigation-grid :nav-items="navItemList" />
</template>

<script lang="ts">
import Vue from 'vue';
import { NavigationGridItem } from '@tager/admin-ui';

import {
  getBlogCategoryListUrl,
  getBlogPostListUrl,
} from '../../constants/paths';

export default Vue.extend({
  name: 'Home',
  data(): {
    blogNavItem: NavigationGridItem;
  } {
    return {
      blogNavItem: {
        name: this.$t('blog:blog'),
        linkList: [
          { href: getBlogPostListUrl(), label: this.$t('blog:posts') },
          { href: getBlogCategoryListUrl(), label: this.$t('blog:categories') },
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
