import { TFunction } from 'i18next';

import { notEmpty, Nullable } from '@tager/admin-services';
import { ColumnDefinition } from '@tager/admin-ui';

import {
  Category,
  ModuleConfig,
  Language,
  PostShort,
} from '../../../typings/model';
import { getBlogPostFormUrl } from '../../../constants/paths';

export function convertPostList(
  postList: PostShort[],
  selectedCategory: Nullable<Category>,
  languages: Language[]
): PostShort[] {
  return postList
    .filter((post) =>
      selectedCategory
        ? post.categories.some(({ id }) => id === selectedCategory.id)
        : true
    )
    .map((post) => {
      if (languages.length > 0) {
        const foundLanguage = languages.find(({ id }) => id === post.language);

        return {
          ...post,
          language: foundLanguage ? foundLanguage.name : post.language,
        };
      }

      return post;
    });
}

export function getStatuses(t: TFunction): Record<string, string> {
  return {
    PUBLISHED: t('blog:statusPublished'),
    DRAFT: t('blog:statusDraft'),
    ARCHIVED: t('blog:statusArchived'),
  };
}

export function getPostTableColumnDefs(
  moduleConfig: Nullable<ModuleConfig>,
  t: TFunction
): ColumnDefinition<PostShort>[] {
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
      name: t('blog:status'),
      field: 'status',
      style: { width: '140px' },
      headStyle: { width: '140px' },
    },
    {
      id: 3,
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
      id: 4,
      name: t('blog:image'),
      field: 'image',
      type: 'image',
      style: { width: '250px' },
      headStyle: { width: '250px' },
    },
    isLangSpecific
      ? { id: 5, name: t('blog:language'), field: 'language' }
      : null,
    {
      id: 6,
      name: t('blog:date'),
      field: 'datetime',
      type: 'datetime',
      options: { ignoreStartOfDayTime: true },
    },
    {
      id: 7,
      name: t('blog:categories'),
      field: 'categories',
      format: ({ row }) =>
        row.categories.map((category) => category.name).join(', '),
    },
    {
      id: 8,
      name: t('blog:actions'),
      field: 'actions',
      style: { whiteSpace: 'nowrap', width: '120px' },
      headStyle: { whiteSpace: 'nowrap', width: '120px' },
    },
  ];

  return COLUMN_DEFS.filter(notEmpty);
}
