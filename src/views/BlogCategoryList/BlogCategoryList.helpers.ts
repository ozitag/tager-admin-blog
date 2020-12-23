import { notEmpty, Nullable } from '@tager/admin-services';
import { ColumnDefinition } from '@tager/admin-ui';

import { BlogCategory, BlogModuleConfigType } from '../../typings/model';
import { getBlogCategoryFormUrl } from '../../constants/paths';

export function convertCategoryList(
  categoryList: Array<BlogCategory>,
  languages: BlogModuleConfigType['languages']
): Array<BlogCategory> {
  return categoryList.map((category) => {
    if (languages.length > 0) {
      const foundLanguage = languages.find(
        (lang) => category.language === lang.id
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
  moduleConfig: Nullable<BlogModuleConfigType>
): Array<ColumnDefinition<BlogCategory>> {
  const isLangSpecific = moduleConfig
    ? moduleConfig.languages.length > 0
    : false;

  const COLUMN_DEFS: Array<ColumnDefinition<BlogCategory> | null> = [
    {
      id: 2,
      name: 'Name',
      field: 'name',
      type: 'name',
      format: ({ row }) => {
        return {
          adminLink: {
            url: getBlogCategoryFormUrl({ categoryId: row.id }),
            text: row.name,
          },
          websiteLink: {
            url: [
              process.env.VUE_APP_WEBSITE_URL || window.location.origin,
              row.url,
            ].join(''),
            text: row.url,
          },
        };
      },
    },
    isLangSpecific ? { id: 4, name: 'Language', field: 'language' } : null,
    {
      id: 3,
      name: 'Posts',
      field: 'linkToPosts',
      style: { whiteSpace: 'nowrap', width: '130px' },
    },
    {
      id: 4,
      name: 'Actions',
      field: 'actions',
      style: { whiteSpace: 'nowrap', width: '205px' },
      headStyle: { whiteSpace: 'nowrap', width: '205px' },
      class: 'actions-cell',
    },
  ];

  return COLUMN_DEFS.filter(notEmpty);
}
