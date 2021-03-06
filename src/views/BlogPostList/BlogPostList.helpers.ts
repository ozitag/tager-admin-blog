import { TFunction } from 'i18next';

import { notEmpty, Nullable } from '@tager/admin-services';
import { ColumnDefinition } from '@tager/admin-ui';

import {
  BlogCategory,
  BlogModuleConfigType,
  PostShort,
} from '../../typings/model';
import { getBlogPostFormUrl } from '../../constants/paths';

export function convertPostList(
  postList: Array<PostShort>,
  selectedCategory: Nullable<BlogCategory>,
  languages: BlogModuleConfigType['languages']
): Array<PostShort> {
  return postList
    .filter((post) =>
      selectedCategory
        ? post.categories.some(
            (category) => category.id === selectedCategory.id
          )
        : true
    )
    .map((post) => {
      if (languages.length > 0) {
        const foundLanguage = languages.find(
          (lang) => post.language === lang.id
        );

        return {
          ...post,
          language: foundLanguage ? foundLanguage.name : post.language,
        };
      }

      return post;
    });
}

export function getPostTableColumnDefs(
  moduleConfig: Nullable<BlogModuleConfigType>,
  t: TFunction
): Array<ColumnDefinition<PostShort>> {
  const isLangSpecific = moduleConfig
    ? moduleConfig.languages.length > 0
    : false;

  const COLUMN_DEFS: Array<ColumnDefinition<PostShort> | null> = [
    {
      id: 1,
      name: 'ID',
      field: 'id',
      style: { width: '50px', textAlign: 'center' },
      headStyle: { width: '50px', textAlign: 'center' },
    },
    {
      id: 2,
      name: t('blog:name'),
      field: 'name',
      type: 'name',
      format: ({ row }) => ({
        adminLink: {
          text: row.title,
          url: getBlogPostFormUrl({ postId: row.id }),
        },
        websiteLink: {
          text: row.url,
          url: [
            process.env.VUE_APP_WEBSITE_URL || window.location.origin,
            row.url,
          ].join(''),
        },
      }),
    },
    {
      id: 3,
      name: t('blog:image'),
      field: 'image',
      type: 'image',
      style: { width: '250px' },
      headStyle: { width: '250px' },
    },
    isLangSpecific
      ? { id: 4, name: t('blog:language'), field: 'language' }
      : null,
    { id: 5, name: t('blog:date'), field: 'date', type: 'date' },
    {
      id: 6,
      name: t('blog:categories'),
      field: 'categories',
      format: ({ row }) =>
        row.categories.map((category) => category.name).join(', '),
    },
    {
      id: 7,
      name: t('blog:actions'),
      field: 'actions',
      style: { whiteSpace: 'nowrap', width: '120px' },
      headStyle: { whiteSpace: 'nowrap', width: '120px' },
    },
  ];

  return COLUMN_DEFS.filter(notEmpty);
}
