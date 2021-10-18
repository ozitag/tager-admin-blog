<template>
  <page-layout :sidebar-menu-list="sidebarMenuList">
    <router-view />
  </page-layout>
</template>

<script lang="ts">
import { defineComponent, onMounted, SetupContext } from '@vue/composition-api';

import { userNamespace } from '../utils/common';
import { useStore } from '../hooks';
import { USER_ACTION_TYPES } from '../store/user';
import { getBlogMenuItem } from '../constants/menu';

export default defineComponent({
  name: 'App',
  setup(props, context: SetupContext) {
    const store = useStore(context);
    const blogMenuItem = getBlogMenuItem({ t: context.root.$t });

    onMounted(() => {
      store.dispatch(userNamespace(USER_ACTION_TYPES.FETCH_USER_PROFILE));
    });

    return {
      sidebarMenuList: [blogMenuItem],
    };
  },
});
</script>
