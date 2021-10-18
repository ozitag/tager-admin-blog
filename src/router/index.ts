import {
  createRouter,
  CustomRoute,
  CustomRouteConfig,
} from '@tager/admin-layout';

import Home from '@/views/Home.vue';

import {
  BLOG_CATEGORY_FORM_ROUTE,
  BLOG_CATEGORY_LIST_ROUTE,
  BLOG_POST_FORM_ROUTE,
  BLOG_POST_LIST_ROUTE,
} from '../constants/routes';

export const HOME_ROUTE: CustomRouteConfig = {
  path: '/',
  component: Home,
  name: 'Home',
  meta: {
    getBreadcrumbs: (route: CustomRoute) => [
      { url: '/', text: route.name ?? '' },
    ],
  },
};

const router = createRouter(
  {
    routes: [
      HOME_ROUTE,
      BLOG_POST_LIST_ROUTE,
      BLOG_POST_FORM_ROUTE,
      BLOG_CATEGORY_LIST_ROUTE,
      BLOG_CATEGORY_FORM_ROUTE,
    ],
  },
  { useTitleSync: false }
);

export default router;
