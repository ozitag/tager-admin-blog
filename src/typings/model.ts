import { Nullable, FileType } from '@tager/admin-services';

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
  readonly categories: Array<BlogCategory>;
  readonly body: string;
  readonly coverImage: Nullable<FileType>;
} & SeoInfo;

export type BlogModuleConfigType = {
  readonly languages: Array<{
    id: string;
    name: string;
  }>;
};

interface SettingsItem {
  readonly field: string;
  readonly label: string;
  readonly type: string;
  readonly value: any;
}

interface SettingsItemFile extends SettingsItem {
  type: 'IMAGE' | 'FILE';
  value: Nullable<FileType>;
}

interface SettingsItemFileList extends SettingsItem {
  type: 'GALLERY';
  value: Array<FileType>;
}

interface SettingsItemString extends SettingsItem {
  type: 'NUMBER' | 'STRING' | 'TEXT';
  value: Nullable<string>;
}

export type SettingsItemType =
  | SettingsItemFile
  | SettingsItemFileList
  | SettingsItemString;
