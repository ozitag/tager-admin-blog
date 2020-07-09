import { Nullable, ImageType } from '@tager/admin-services';

export type SeoInfo = {
  pageTitle: Nullable<string>;
  pageDescription: Nullable<string>;
  openGraphImage: Nullable<ImageType>;
};

export type BlogCategory = {
  id: number;
  name: string;
  urlAlias: string;
} & SeoInfo;

export type Post = {
  id: number;
  title: string;
  urlAlias: string;
  websiteUrl: string;
  date: string;
  status: string;
  excerpt: string;
  body: string;
  image: Nullable<ImageType>;
  coverImage: Nullable<ImageType>;
  categories: Array<BlogCategory>;
} & SeoInfo;
