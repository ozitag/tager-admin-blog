import { CustomRoute, CustomRouteConfig } from '@tager/admin-layout';

import BlogPostList from '../views/Posts/PostList';
import BlogPostForm from '../views/Posts/PostForm';
import BlogCategoryList from '../views/Categories/CategoryList';
import BlogCategoryForm from '../views/Categories/CategoryForm';

import { BLOG_ROUTE_PATHS } from './paths';

export const BLOG_POST_LIST_ROUTE: CustomRouteConfig = {
  path: BLOG_ROUTE_PATHS.POST_LIST,
  component: BlogPostList,
  name: 'All posts',
  meta: {
    getBreadcrumbs: (route, t) => [
      { url: '/', text: t('blog:home') },
      { url: BLOG_ROUTE_PATHS.POST_LIST, text: t('blog:allPosts') },
    ],
  },
};

export const BLOG_POST_FORM_ROUTE: CustomRouteConfig = {
  path: BLOG_ROUTE_PATHS.POST_FORM,
  component: BlogPostForm,
  name: 'Post Form',
  meta: {
    getBreadcrumbs: (route: CustomRoute, t) => [
      { url: '/', text: t('blog:home') },
      { url: BLOG_ROUTE_PATHS.POST_LIST, text: t('blog:allPosts') },
      { url: route.path, text: t('blog:postForm') },
    ],
  },
};

export const BLOG_CATEGORY_LIST_ROUTE: CustomRouteConfig = {
  path: BLOG_ROUTE_PATHS.CATEGORY_LIST,
  component: BlogCategoryList,
  name: 'All categories',
  meta: {
    getBreadcrumbs: (route, t) => [
      { url: '/', text: t('blog:home') },
      { url: BLOG_ROUTE_PATHS.CATEGORY_LIST, text: t('blog:allCategories') },
    ],
  },
};

export const BLOG_CATEGORY_FORM_ROUTE: CustomRouteConfig = {
  path: BLOG_ROUTE_PATHS.CATEGORY_FORM,
  component: BlogCategoryForm,
  name: 'Category Form',
  meta: {
    getBreadcrumbs: (route: CustomRoute, t) => [
      { url: '/', text: t('blog:home') },
      { url: BLOG_ROUTE_PATHS.CATEGORY_LIST, text: t('blog:allCategories') },
      { url: route.path, text: t('blog:categoryForm') },
    ],
  },
};
