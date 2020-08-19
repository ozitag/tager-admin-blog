<template>
  <navigation-grid :nav-items="navItemList" />
</template>

<script lang="ts">
import { NavigationGridItem } from '@tager/admin-ui';

import {
  getBlogCategoryListUrl,
  getBlogPostListUrl,
  getBlogSettingsUrl,
} from '../constants/paths';
import { computed, defineComponent, ref } from '@vue/composition-api';
import { TranslateFunction } from '@tager/admin-services';

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
          { url: getBlogSettingsUrl(), text: context.root.$t('blog:settings') },
        ],
      },
    ]);

    return { navItemList };
  },
});
</script>

<style scoped lang="scss"></style>
