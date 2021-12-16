import { TFunction } from 'i18next';

import { createId, Nullable } from '@tager/admin-services';
import { OptionType, SingleFileInputValueType } from '@tager/admin-ui';
import {
  FieldConfigUnion,
  FieldUnion,
  universalFieldUtils
} from '@tager/admin-dynamic-field';

import {
  PostCreationPayload,
  PostUpdatePayload
} from '../../../services/requests';
import { getNameWithDepth } from '../../../utils/common';
import { Category, PostFull } from '../../../typings/model';

export const getStatusOptions = (t: TFunction): OptionType[] => [
  { label: t('blog:statusPublished'), value: 'PUBLISHED' },
  { label: t('blog:statusDraft'), value: 'DRAFT' },
  { label: t('blog:statusArchived'), value: 'ARCHIVED' }
];

export interface FormValues {
  title: string;
  excerpt: string;
  body: string;
  datetime: string;
  coverImage: Nullable<SingleFileInputValueType>;
  image: Nullable<SingleFileInputValueType>;
  imageMobile: Nullable<SingleFileInputValueType>;
  pageTitle: string;
  pageDescription: string;
  openGraphImage: Nullable<SingleFileInputValueType>;
  urlAlias: string;
  categories: OptionType<number>[];
  language: Nullable<OptionType>;
  relatedPosts: OptionType<number>[];
  tags: string;
  additionalFields: FieldUnion[];
  status: OptionType;
  statusDateEnabled: boolean;
  statusDate: Nullable<string>;
}

export function convertPostToFormValues(
  post: Nullable<PostFull>,
  languageOptionList: OptionType[],
  postOptionList: OptionType<number>[],
  additionalFieldList: FieldConfigUnion[],
  statusOptions: OptionType[]
): FormValues {
  if (!post) {
    return {
      title: '',
      excerpt: '',
      body: '',
      datetime: '',
      coverImage: null,
      image: null,
      imageMobile: null,
      pageTitle: '',
      pageDescription: '',
      openGraphImage: null,
      urlAlias: '',
      categories: [],
      language: null,
      relatedPosts: [],
      tags: '',
      additionalFields: additionalFieldList.map((fieldConfig) =>
        universalFieldUtils.createFormField(fieldConfig, null)
      ),
      status: statusOptions[0],
      statusDateEnabled: false,
      statusDate: null
    };
  }

  const currentLangOption = languageOptionList.find(
    (option) => option.value === post.language
  );

  const selectedPostOptionList = postOptionList.filter((option) =>
    post.relatedPosts.some((relatedPost) => relatedPost.id === option.value)
  );

  const foundStatus =
    statusOptions.find(({ value }) => value === post.status) ??
    statusOptions[0];

  return {
    title: post.title,
    excerpt: post.excerpt,
    body: post.body,
    datetime: post.datetime ? post.datetime.substr(0, 10) : '',
    coverImage: post.coverImage
      ? { id: createId(), file: post.coverImage }
      : null,
    image: post.image ? { id: createId(), file: post.image } : null,
    imageMobile: post.imageMobile
      ? { id: createId(), file: post.imageMobile }
      : null,
    pageTitle: post.pageTitle ?? '',
    pageDescription: post.pageDescription ?? '',
    openGraphImage: post.openGraphImage
      ? { id: createId(), file: post.openGraphImage }
      : null,
    urlAlias: post.urlAlias,
    categories: post.categories.map((category) => ({
      value: category.id,
      label: category.name
    })),
    language: currentLangOption ?? null,
    relatedPosts: selectedPostOptionList,
    tags: post.tags.join(','),
    additionalFields: additionalFieldList.map((fieldConfig) => {
      const postAdditionalField = post.additionalFields.find(
        ({ name }) => name === fieldConfig.name
      );
      return universalFieldUtils.createFormField(
        fieldConfig,
        postAdditionalField?.value
      );
    }),
    status: foundStatus,
    statusDateEnabled: post.status === 'PUBLISHED' ? !!post.archiveAt : (post.status === 'DRAFT' ? !!post.publishAt : false),
    statusDate: post.status === 'PUBLISHED' && post.archiveAt ? post.archiveAt.substr(0, 10) : (post.status === 'DRAFT' && post.publishAt ? post.publishAt.substr(0, 10) : null)
  };
}

export function convertFormValuesToCreationPayload(
  values: FormValues
): PostCreationPayload {
  return {
    title: values.title,
    excerpt: values.excerpt,
    urlAlias: values.urlAlias,
    body: values.body,
    datetime: values.datetime,
    coverImage: values.coverImage?.file.id ?? null,
    image: values.image?.file.id ?? null,
    imageMobile: values.imageMobile?.file.id ?? null,
    pageTitle: values.pageTitle,
    pageDescription: values.pageDescription,
    openGraphImage: values.openGraphImage?.file.id ?? null,
    categories: values.categories.map((option) => option.value),
    language: values.language?.value ?? null,
    relatedPosts: values.relatedPosts.map(
      (relatedPostOption) => relatedPostOption.value
    ),
    tags: values.tags.split(',').filter((tag) => tag.trim().length > 0),
    additionalFields: values.additionalFields.map((field) => ({
      name: field.config.name,
      value: universalFieldUtils.getOutgoingValue(field)
    })),
    status: values.status.value,
    archiveAt: values.status.value === 'PUBLISHED' && values.statusDateEnabled && values.statusDate ? values.statusDate : null,
    publishAt: values.status.value === 'DRAFT' && values.statusDateEnabled && values.statusDate ? values.statusDate : null
  };
}

export function convertFormValuesToUpdatePayload(
  values: FormValues
): PostUpdatePayload {
  return {
    ...convertFormValuesToCreationPayload(values),
    urlAlias: values.urlAlias
  };
}

export function convertCategoryListToOptions(
  categoryList: Category[],
  languageId: Nullable<string>
): OptionType<number>[] {
  return categoryList
    .filter(({ language }) => (languageId ? language === languageId : true))
    .map(({ id, name, depth }) => ({
      value: id,
      label: getNameWithDepth(name, depth)
    }));
}
