import { Post, BlogCategory } from '@/typings/model';
import { request, Nullable, ResponseBody } from '@tager/admin-services';

/** Blog Posts */

export function getBlogPostList(): Promise<ResponseBody<Array<Post>>> {
  return request.get({ path: '/blog/posts' });
}

export function getBlogPost(
  postId: number | string
): Promise<ResponseBody<Post>> {
  return request.get({ path: `/blog/posts/${postId}` });
}

export type PostCreationPayload = {
  title: string;
  excerpt: string;
  body: string;
  date: string;
  image: Nullable<number>;
  coverImage: Nullable<number>;
  status: string;
  pageTitle: string;
  pageDescription: string;
  openGraphImage: Nullable<number>;
  categories: Array<number>;
};

export function createBlogPost(
  payload: PostCreationPayload
): Promise<ResponseBody<Post>> {
  return request.post({ path: '/blog/posts', body: payload });
}

export type PostUpdatePayload = PostCreationPayload & {
  urlAlias: string;
};

export function updateBlogPost(
  postId: number | string,
  payload: PostUpdatePayload
): Promise<ResponseBody<Post>> {
  return request.put({ path: `/blog/posts/${postId}`, body: payload });
}

export function deleteBlogPost(
  postId: number | string
): Promise<{ success: boolean }> {
  return request.delete({ path: `/blog/posts/${postId}` });
}

/** Blog Categories */

export function getBlogCategoryList(): Promise<
  ResponseBody<Array<BlogCategory>>
> {
  return request.get({ path: '/blog/categories' });
}

export function getBlogCategory(
  categoryId: number | string
): Promise<ResponseBody<BlogCategory>> {
  return request.get({ path: `/blog/categories/${categoryId}` });
}

export type BlogCategoryCreationPayload = {
  name: string;
  pageTitle: Nullable<string>;
  pageDescription: Nullable<string>;
  openGraphImage: Nullable<number>;
};

export function createBlogCategory(
  payload: BlogCategoryCreationPayload
): Promise<ResponseBody<BlogCategory>> {
  return request.post({ path: '/blog/categories', body: payload });
}

export type BlogCategoryUpdatePayload = BlogCategoryCreationPayload & {
  urlAlias: string;
};

export function updateBlogCategory(
  categoryId: number | string,
  payload: BlogCategoryUpdatePayload
): Promise<ResponseBody<BlogCategory>> {
  return request.put({
    path: `/blog/categories/${categoryId}`,
    body: payload,
  });
}

export function deleteBlogCategory(
  categoryId: number | string
): Promise<{ success: boolean }> {
  return request.delete({
    path: `/blog/categories/${categoryId}`,
  });
}
