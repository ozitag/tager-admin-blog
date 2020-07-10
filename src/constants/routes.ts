import { CustomRoute, CustomRouteConfig } from '@tager/admin-layout';

import BlogPostList from '../views/BlogPostList/index.vue';
import BlogPostForm from '../views/BlogPostForm/index.vue';
import BlogCategoryList from '../views/BlogCategoryList/index.vue';
import BlogCategoryForm from '../views/BlogCategoryForm/index.vue';

import { BLOG_ROUTE_PATHS } from './paths';

export const BLOG_POST_LIST_ROUTE: CustomRouteConfig = {
  path: BLOG_ROUTE_PATHS.POST_LIST,
  component: BlogPostList,
  name: 'All posts',
  meta: {
    getBreadcrumbs: () => [
      { path: BLOG_ROUTE_PATHS.HOME, label: 'Home' },
      { path: BLOG_ROUTE_PATHS.POST_LIST, label: 'All posts' },
    ],
  },
};

export const BLOG_POST_FORM_ROUTE: CustomRouteConfig = {
  path: BLOG_ROUTE_PATHS.POST_FORM,
  component: BlogPostForm,
  name: 'Post Form',
  meta: {
    getBreadcrumbs: (route: CustomRoute) => [
      { path: BLOG_ROUTE_PATHS.HOME, label: 'Home' },
      { path: BLOG_ROUTE_PATHS.POST_LIST, label: 'All posts' },
      { path: route.path, label: 'Blog post form' },
    ],
  },
};

export const BLOG_CATEGORY_LIST_ROUTE: CustomRouteConfig = {
  path: BLOG_ROUTE_PATHS.CATEGORY_LIST,
  component: BlogCategoryList,
  name: 'All categories',
  meta: {
    getBreadcrumbs: () => [
      { path: BLOG_ROUTE_PATHS.HOME, label: 'Home' },
      { path: BLOG_ROUTE_PATHS.CATEGORY_LIST, label: 'All categories' },
    ],
  },
};

export const BLOG_CATEGORY_FORM_ROUTE: CustomRouteConfig = {
  path: BLOG_ROUTE_PATHS.CATEGORY_FORM,
  component: BlogCategoryForm,
  name: 'Category Form',
  meta: {
    getBreadcrumbs: (route: CustomRoute) => [
      { path: BLOG_ROUTE_PATHS.HOME, label: 'Home' },
      { path: BLOG_ROUTE_PATHS.CATEGORY_LIST, label: 'All categories' },
      { path: route.path, label: 'Blog Category form' },
    ],
  },
};
