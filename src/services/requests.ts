import { request, Nullable, ResponseBody } from '@tager/admin-services';
import { FieldShortType, OutgoingValueUnion } from '@tager/admin-dynamic-field';

import {
  Category,
  ModuleConfig,
  PostShort,
  PostFull,
  UserModel,
} from '@/typings/model';

export function getUserProfile(): Promise<ResponseBody<UserModel>> {
  return request.get({ path: '/admin/self' });
}

/** Blog Posts */

export function getBlogPostList(params?: {
  query?: string;
  pageNumber?: number;
  pageSize?: number;
}): Promise<ResponseBody<PostShort[]>> {
  return request.get({ path: '/admin/blog/posts', params });
}

export function getBlogPostCount(): Promise<ResponseBody<{ count: number }>> {
  return request.get({ path: '/admin/blog/posts/count' });
}

export function getBlogPost(
  postId: number | string
): Promise<ResponseBody<PostFull>> {
  return request.get({ path: `/admin/blog/posts/${postId}` });
}

export interface PostCreationPayload {
  title: string;
  urlAlias: string;
  excerpt: string;
  body: string;
  date: string;
  coverImage: Nullable<string>;
  image: Nullable<string>;
  imageMobile: Nullable<string>;
  status: string;
  pageTitle: string;
  pageDescription: string;
  openGraphImage: Nullable<string>;
  categories: number[];
  language: Nullable<string>;
  relatedPosts: number[];
  tags: string[];
  additionalFields: FieldShortType<OutgoingValueUnion>[];
}

export function createBlogPost(
  payload: PostCreationPayload
): Promise<ResponseBody<PostFull>> {
  return request.post({ path: '/admin/blog/posts', body: payload });
}

export type PostUpdatePayload = PostCreationPayload & {
  urlAlias: string;
};

export function updateBlogPost(
  postId: number | string,
  payload: PostUpdatePayload
): Promise<ResponseBody<PostFull>> {
  return request.put({ path: `/admin/blog/posts/${postId}`, body: payload });
}

export function deleteBlogPost(
  postId: number | string
): Promise<{ success: boolean }> {
  return request.delete({ path: `/admin/blog/posts/${postId}` });
}

/** Blog Categories */

export function getBlogCategoryList(params?: {
  query?: string;
  pageNumber?: number;
  pageSize?: number;
}): Promise<ResponseBody<Category[]>> {
  return request.get({ path: '/admin/blog/categories', params });
}

export function getBlogCategory(
  categoryId: number | string
): Promise<ResponseBody<Category>> {
  return request.get({ path: `/admin/blog/categories/${categoryId}` });
}

export interface BlogCategoryCreationPayload {
  name: string;
  isDefault: boolean;
  pageTitle: Nullable<string>;
  language: Nullable<string>;
  pageDescription: Nullable<string>;
  openGraphImage: Nullable<string>;
}

export function createBlogCategory(
  payload: BlogCategoryCreationPayload
): Promise<ResponseBody<Category>> {
  return request.post({ path: '/admin/blog/categories', body: payload });
}

export type BlogCategoryUpdatePayload = BlogCategoryCreationPayload & {
  urlAlias: string;
};

export function updateBlogCategory(
  categoryId: number | string,
  payload: BlogCategoryUpdatePayload
): Promise<ResponseBody<Category>> {
  return request.put({
    path: `/admin/blog/categories/${categoryId}`,
    body: payload,
  });
}

export function deleteBlogCategory(
  categoryId: number | string
): Promise<{ success: boolean }> {
  return request.delete({
    path: `/admin/blog/categories/${categoryId}`,
  });
}

export function moveBlogCategory(
  categoryId: number | string,
  direction: 'up' | 'down'
): Promise<{ success: boolean }> {
  return request.post({
    path: `/admin/blog/categories/move/${categoryId}/${direction}`,
  });
}

export function getBlogModuleConfig(): Promise<ResponseBody<ModuleConfig>> {
  return request.get({
    path: `/admin/blog/module-info`,
  });
}
