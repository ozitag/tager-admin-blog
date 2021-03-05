<template>
  <navigation-grid :nav-items="navItemList" />
</template>

<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api';

import { NavigationGridItem } from '@tager/admin-ui';

import { getBlogCategoryListUrl, getBlogPostListUrl } from '../constants/paths';

export default defineComponent({
  name: 'Home',
  setup(props, context) {
    const navItemList = ref<Array<NavigationGridItem>>([
      {
        name: context.root.$t('blog:blog'),
        linkList: [
          { url: getBlogPostListUrl(), text: context.root.$t('blog:posts') },
          {
            url: getBlogCategoryListUrl(),
            text: context.root.$t('blog:categories'),
          },
        ],
      },
    ]);

    return { navItemList };
  },
});
</script>

<style scoped lang="scss"></style>
