import { Nullable, FileType } from '@tager/admin-services';
import {
  FieldConfigUnion,
  FieldShortType,
  IncomingValueUnion,
} from '@tager/admin-dynamic-field';
import { ShortCodeItemType } from '@tager/admin-ui';

import { Values } from '@/typings/common';
import { Scope } from '@/constants/scopes';

export type ScopeType = Values<typeof Scope>;

export interface RoleModel {
  readonly id: number;
  readonly name: string;
  readonly scopes: Array<ScopeType>;
}

export interface UserModel {
  readonly id: number;
  readonly name: string;
  readonly email: string;
  readonly roles: Array<RoleModel>;
}

export interface SeoInfo {
  readonly pageTitle: Nullable<string>;
  readonly pageDescription: Nullable<string>;
  readonly pageKeywords: Nullable<string>;
  readonly openGraphTitle: Nullable<string>;
  readonly openGraphDescription: Nullable<string>;
  readonly openGraphImage: Nullable<FileType>;
}

export interface Category extends SeoInfo {
  readonly id: number;
  readonly name: string;
  readonly isDefault: boolean;
  readonly language: string;
  readonly url: string;
  readonly urlTemplate: string;
  readonly urlAlias: string;
  readonly postsCount: string;
  readonly parent: Nullable<Pick<Category, 'id' | 'name'>>;
  readonly depth: number;
}

export interface PostShort {
  readonly id: number;
  readonly title: string;
  readonly url: string;
  readonly excerpt: string;
  readonly status: string;
  readonly language: string;
  readonly categories: Category[];
  readonly date: string;
  readonly image: Nullable<FileType>;
}

export interface PostFull extends SeoInfo {
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
  readonly categories: Category[];
  readonly body: string;
  readonly coverImage: Nullable<FileType>;
  readonly relatedPosts: Pick<PostShort, 'id' | 'title'>[];
  readonly tags: string[];
  readonly additionalFields: FieldShortType<IncomingValueUnion>[];
}

export interface Language {
  readonly id: string;
  readonly name: string;
}

export interface DefaultCategory {
  readonly id: number;
  readonly name: string;
  readonly language: string;
}

export interface FileScenarios {
  readonly cover: Nullable<string>;
  readonly image: Nullable<string>;
  readonly imageMobile: Nullable<string>;
  readonly content: Nullable<string>;
  readonly openGraph: Nullable<string>;
}

export interface ModuleConfig {
  readonly urlPostTemplate: Nullable<string>;
  readonly urlCategoryTemplate: Nullable<string>;
  readonly languages: Language[];
  readonly defaultCategories: DefaultCategory[];
  readonly fields: FieldConfigUnion[];
  readonly shortcodes: ShortCodeItemType[];
  readonly fileScenarios: FileScenarios;
}
