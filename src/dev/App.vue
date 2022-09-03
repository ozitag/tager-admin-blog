<template>
  <PageLayout :sidebar-menu-list="sidebarMenuList">
    <router-view />
  </PageLayout>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { MenuItemType, PageLayout } from '@tager/admin-layout';
import { ViewListIcon } from '@tager/admin-ui';
import { useI18n } from '@tager/admin-services';

import {
  getBlogCategoryFormUrl,
  getBlogCategoryListUrl,
  getBlogPostFormUrl,
  getBlogPostListUrl,
} from '../utils/paths';

export default defineComponent({
  name: 'App',
  components: {
    PageLayout,
  },
  setup() {
    const i18n = useI18n();

    const sidebarMenuList: Array<MenuItemType> = [
      {
        id: 'blog',
        text: i18n.t('blog:blog'),
        icon: ViewListIcon,
        children: [
          {
            text: i18n.t('blog:createPost'),
            url: getBlogPostFormUrl({ postId: 'create' }),
          },
          { text: i18n.t('blog:posts'), url: getBlogPostListUrl() },
          {
            text: i18n.t('blog:createCategory'),
            url: getBlogCategoryFormUrl({ categoryId: 'create' }),
          },
          { text: i18n.t('blog:categories'), url: getBlogCategoryListUrl() },
        ],
      },
    ];

    return {
      sidebarMenuList,
    };
  },
});
</script>

<style scoped lang="scss"></style>
