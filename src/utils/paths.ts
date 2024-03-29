import { compile } from 'path-to-regexp';

import { BLOG_ROUTE_PATHS } from '../constants/paths';

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
