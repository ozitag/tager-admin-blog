import { TFunction } from 'i18next';

import { getWebsiteOrigin, notEmpty, Nullable } from '@tager/admin-services';
import { ColumnDefinition } from '@tager/admin-ui';

import { Category, Language, ModuleConfig } from '@/typings/model';
import { getBlogCategoryFormUrl, getBlogPostListUrl } from '@/constants/paths';
import { getNameWithDepth } from '@/utils/common';

export function convertCategoryList(
  categoryList: Category[],
  languages: Language[]
): Category[] {
  return categoryList.map((category) => {
    if (languages.length > 0) {
      const foundLanguage = languages.find(
        ({ id }) => category.language === id
      );

      return {
        ...category,
        language: foundLanguage ? foundLanguage.name : category.language,
      };
    }

    return category;
  });
}

export function getCategoryTableColumnDefs(
  moduleConfig: Nullable<ModuleConfig>,
  t: TFunction,
  canViewAdministrators: boolean
): ColumnDefinition<Category>[] {
  const isLangSpecific = moduleConfig
    ? moduleConfig.languages.length > 0
    : false;

  const COLUMN_DEFS: (ColumnDefinition<Category> | null)[] = [
    {
      id: 1,
      name: t('blog:name'),
      field: 'name',
      type: 'name',
      format: ({ row }) => ({
        adminLink: {
          url: getBlogCategoryFormUrl({ categoryId: row.id }),
          text: getNameWithDepth(row.name, row.depth),
        },
        paramList: row.isDefault
          ? [{ name: t('blog:defaultCategory'), value: t('blog:yes') }]
          : [],
      }),
    },
    {
      id: 2,
      name: t('blog:link'),
      field: 'path',
      type: 'link',
      format: ({ row }) => ({
        url: `${getWebsiteOrigin()}${row.url}`,
        text: row.url,
      }),
      options: {
        shouldOpenNewTab: true,
      },
    },
    isLangSpecific
      ? { id: 3, name: t('blog:language'), field: 'language' }
      : null,
    {
      id: 4,
      name: t('blog:posts'),
      field: 'linkToPosts',
      style: { whiteSpace: 'nowrap', width: '130px' },
    },
    canViewAdministrators
      ? {
          id: 5,
          name: t('blog:actions'),
          field: 'actions',
          style: { whiteSpace: 'nowrap', width: '170px' },
          headStyle: { whiteSpace: 'nowrap', width: '170px' },
          class: 'actions-cell',
        }
      : null,
  ];

  return COLUMN_DEFS.filter(notEmpty);
}

export function getLinkToPostsByCategory(categoryId: number): string {
  return `${getBlogPostListUrl()}?filter[category]=${categoryId}`;
}
