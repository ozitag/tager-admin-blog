import { Nullable, FileType } from '@tager/admin-services';
import {
  FieldConfigUnion,
  FieldShortType,
  IncomingValueUnion,
} from '@tager/admin-dynamic-field';
import { ShortCodeItemType } from '@tager/admin-ui';

export type SeoInfo = {
  readonly pageTitle: Nullable<string>;
  readonly pageDescription: Nullable<string>;
  readonly openGraphImage: Nullable<FileType>;
};

export type BlogCategory = {
  readonly id: number;
  readonly name: string;
  readonly language: string;
  readonly url: string;
  readonly urlTemplate: string;
  readonly urlAlias: string;
  readonly postsCount: string;
} & SeoInfo;

export type PostShort = {
  readonly id: number;
  readonly title: string;
  readonly url: string;
  readonly excerpt: string;
  readonly status: string;
  readonly language: string;
  readonly categories: Array<BlogCategory>;
  readonly date: string;
  readonly image: Nullable<FileType>;
};

export type PostFull = {
  readonly id: number;
  readonly language: string;
  readonly title: string;
  readonly url: string;
  readonly urlTemplate: string;
  readonly urlAlias: string;
  readonly date: string;
  readonly status: string;
  readonly excerpt: string;
  readonly image: Nullable<FileType>;
  readonly imageMobile: Nullable<FileType>;
  readonly categories: Array<BlogCategory>;
  readonly body: string;
  readonly coverImage: Nullable<FileType>;
  readonly relatedPosts: Array<Pick<PostShort, 'id' | 'title'>>;
  readonly tags: Array<string>;
  readonly additionalFields: Array<FieldShortType<IncomingValueUnion>>;
} & SeoInfo;

export type BlogModuleConfigType = {
  readonly urlPostTemplate: Nullable<string>;
  readonly urlCategoryTemplate: Nullable<string>;
  readonly languages: Array<{
    id: string;
    name: string;
  }>;
  readonly fields: Array<FieldConfigUnion>;
  readonly shortcodes: Array<ShortCodeItemType>;
  readonly fileScenarios: {
    cover: Nullable<string>;
    image: Nullable<string>;
    imageMobile: Nullable<string>;
    content: Nullable<string>;
    openGraph: Nullable<string>;
  };
};

export type SettingItemType = {
  field: FieldConfigUnion;
  value: IncomingValueUnion;
};
