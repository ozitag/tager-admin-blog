import { compile } from 'path-to-regexp';

export const BLOG_ROUTE_PATHS = {
  POST_LIST: '/blog/posts',
  POST_FORM: '/blog/posts/:postId',
  CATEGORY_LIST: '/blog/categories',
  CATEGORY_FORM: '/blog/categories/:categoryId',
  SETTINGS: '/blog/settings',
} as const;

export function getBlogPostListUrl() {
  return BLOG_ROUTE_PATHS.POST_LIST;
}

export function getBlogPostFormUrl(params: { postId: number | string }) {
  return compile(BLOG_ROUTE_PATHS.POST_FORM)({ postId: params.postId });
}

export function getBlogCategoryListUrl() {
  return BLOG_ROUTE_PATHS.CATEGORY_LIST;
}

export function getBlogCategoryFormUrl(params: {
  categoryId: number | string;
}) {
  return compile(BLOG_ROUTE_PATHS.CATEGORY_FORM)({
    categoryId: params.categoryId,
  });
}

export function getBlogSettingsUrl() {
  return BLOG_ROUTE_PATHS.SETTINGS;
}
