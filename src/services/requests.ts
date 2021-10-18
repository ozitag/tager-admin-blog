import { request, Nullable, ResponseBody } from '@tager/admin-services';
import { FieldShortType, OutgoingValueUnion } from '@tager/admin-dynamic-field';

import {
  Category,
  ModuleConfig,
  PostShort,
  PostFull,
  CategoryPayload,
} from '../typings/model';

/** Blog Posts */

export function getPosts(params?: {
  query?: string;
  pageNumber?: number;
  pageSize?: number;
}): Promise<ResponseBody<PostShort[]>> {
  return request.get({ path: '/admin/blog/posts', params });
}

export function getBlogPostCount(): Promise<ResponseBody<{ count: number }>> {
  return request.get({ path: '/admin/blog/posts/count' });
}

export function getPost(
  postId: number | string
): Promise<ResponseBody<PostFull>> {
  return request.get({ path: `/admin/blog/posts/${postId}` });
}

export function clonePost(
  postId: number | string
): Promise<ResponseBody<PostFull>> {
  return request.post({ path: `/admin/blog/posts/${postId}/clone` });
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

export function getCategories(params?: {
  query?: string;
  pageNumber?: number;
  pageSize?: number;
}): Promise<ResponseBody<Category[]>> {
  return request.get({ path: '/admin/blog/categories', params });
}

export function getCategory(
  categoryId: number | string
): Promise<ResponseBody<Category>> {
  return request.get({ path: `/admin/blog/categories/${categoryId}` });
}

export function createCategory(
  payload: CategoryPayload
): Promise<ResponseBody<Category>> {
  return request.post({ path: '/admin/blog/categories', body: payload });
}

export function updateCategory(
  categoryId: number | string,
  payload: CategoryPayload
): Promise<ResponseBody<Category>> {
  return request.put({
    path: `/admin/blog/categories/${categoryId}`,
    body: payload,
  });
}

export function deleteCategory(
  categoryId: number | string
): Promise<{ success: boolean }> {
  return request.delete({
    path: `/admin/blog/categories/${categoryId}`,
  });
}

export function moveCategory(
  categoryId: number | string,
  direction: 'up' | 'down'
): Promise<{ success: boolean }> {
  return request.post({
    path: `/admin/blog/categories/move/${categoryId}/${direction}`,
  });
}

export function getModuleConfig(): Promise<ResponseBody<ModuleConfig>> {
  return request.get({
    path: `/admin/blog/module-info`,
  });
}
