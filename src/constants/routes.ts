import { CustomRoute, CustomRouteConfig } from '@tager/admin-layout';

import BlogPostList from '../views/BlogPostList';
import BlogPostForm from '../views/BlogPostForm';
import BlogCategoryList from '../views/BlogCategoryList';
import BlogCategoryForm from '../views/BlogCategoryForm';
import BlogSettings from '../views/BlogSettings';

import { BLOG_ROUTE_PATHS, getBlogSettingsUrl } from './paths';

const HOME_BREADCRUMB = { url: '/', text: 'Home' };

export const BLOG_POST_LIST_ROUTE: CustomRouteConfig = {
  path: BLOG_ROUTE_PATHS.POST_LIST,
  component: BlogPostList,
  name: 'All posts',
  meta: {
    getBreadcrumbs: () => [
      HOME_BREADCRUMB,
      { url: BLOG_ROUTE_PATHS.POST_LIST, text: 'All posts' },
    ],
  },
};

export const BLOG_POST_FORM_ROUTE: CustomRouteConfig = {
  path: BLOG_ROUTE_PATHS.POST_FORM,
  component: BlogPostForm,
  name: 'Post Form',
  meta: {
    getBreadcrumbs: (route: CustomRoute) => [
      HOME_BREADCRUMB,
      { url: BLOG_ROUTE_PATHS.POST_LIST, text: 'All posts' },
      { url: route.path, text: 'Blog post form' },
    ],
  },
};

export const BLOG_CATEGORY_LIST_ROUTE: CustomRouteConfig = {
  path: BLOG_ROUTE_PATHS.CATEGORY_LIST,
  component: BlogCategoryList,
  name: 'All categories',
  meta: {
    getBreadcrumbs: () => [
      HOME_BREADCRUMB,
      { url: BLOG_ROUTE_PATHS.CATEGORY_LIST, text: 'All categories' },
    ],
  },
};

export const BLOG_CATEGORY_FORM_ROUTE: CustomRouteConfig = {
  path: BLOG_ROUTE_PATHS.CATEGORY_FORM,
  component: BlogCategoryForm,
  name: 'Category Form',
  meta: {
    getBreadcrumbs: (route: CustomRoute) => [
      HOME_BREADCRUMB,
      { url: BLOG_ROUTE_PATHS.CATEGORY_LIST, text: 'All categories' },
      { url: route.path, text: 'Blog Category form' },
    ],
  },
};

export const BLOG_SETTINGS_ROUTE: CustomRouteConfig = {
  path: BLOG_ROUTE_PATHS.SETTINGS,
  component: BlogSettings,
  name: 'Settings',
  meta: {
    getBreadcrumbs: () => [
      HOME_BREADCRUMB,
      { url: getBlogSettingsUrl(), text: 'Blog settings' },
    ],
  },
};
