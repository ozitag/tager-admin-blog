import { PostFull } from '../../typings/model';
import { FileType, Nullable } from '@tager/admin-services';
import { OptionType } from '@tager/admin-ui';
import {
  PostCreationPayload,
  PostUpdatePayload,
} from '../../services/requests';

export type FormValues = {
  title: string;
  excerpt: string;
  body: string;
  date: string;
  image: Nullable<FileType>;
  coverImage: Nullable<FileType>;
  pageTitle: string;
  pageDescription: string;
  openGraphImage: Nullable<FileType>;
  urlAlias: string;
  categories: Array<OptionType<number>>;
  language: Nullable<OptionType>;
};

export function convertPostToFormValues(
  post: Nullable<PostFull>,
  languageOptionList: Array<OptionType>
): FormValues {
  const currentLangOption = languageOptionList.find(
    (option) => option.value === post?.language
  );

  if (!post) {
    return {
      title: '',
      excerpt: '',
      body: '',
      date: '',
      image: null,
      coverImage: null,
      pageTitle: '',
      pageDescription: '',
      openGraphImage: null,
      urlAlias: '',
      categories: [],
      language: currentLangOption ?? null,
    };
  }
  return {
    title: post.title,
    excerpt: post.excerpt,
    body: post.body,
    date: post.date,
    image: post.image,
    coverImage: post.coverImage,
    pageTitle: post.pageTitle ?? '',
    pageDescription: post.pageDescription ?? '',
    openGraphImage: post.openGraphImage,
    urlAlias: post.urlAlias,
    categories: post.categories.map((category) => ({
      value: category.id,
      label: category.name,
    })),
    language: currentLangOption ?? null,
  };
}

export function convertFormValuesToCreationPayload(
  values: FormValues
): PostCreationPayload {
  return {
    title: values.title,
    excerpt: values.excerpt,
    body: values.body,
    date: values.date,
    image: values.image?.id ?? null,
    coverImage: values.coverImage?.id ?? null,
    pageTitle: values.pageTitle,
    pageDescription: values.pageDescription,
    openGraphImage: values.openGraphImage?.id ?? null,
    status: 'PUBLISHED',
    categories: values.categories.map((option) => option.value),
    language: values.language?.value ?? null,
  };
}

export function convertFormValuesToUpdatePayload(
  values: FormValues
): PostUpdatePayload {
  return {
    ...convertFormValuesToCreationPayload(values),
    urlAlias: values.urlAlias,
  };
}
