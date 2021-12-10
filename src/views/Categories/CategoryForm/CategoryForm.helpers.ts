import { TFunction } from 'i18next';

import { createId, Nullable } from '@tager/admin-services';
import { OptionType } from '@tager/admin-ui';

import {
  Category,
  CategoryFormValues,
  CategoryPayload,
} from '../../../typings/model';
import { getNameWithDepth } from '../../../utils/common';

export function convertCategoryToFormValues(
  category: Nullable<Category>,
  languageOptionList: OptionType[],
  t: TFunction
): CategoryFormValues {
  const currentLangOption = languageOptionList.find(
    ({ value }) => value === category?.language
  );

  if (!category) {
    return {
      language: currentLangOption ?? null,
      name: '',
      parent: { value: null, label: t('blog:noParent') },
      urlAlias: '',
      isDefault: false,

      pageTitle: '',
      pageDescription: '',
      pageKeywords: '',
      openGraphTitle: '',
      openGraphDescription: '',
      openGraphImage: null,
    };
  }

  return {
    language: currentLangOption ?? null,
    isDefault: category.isDefault,
    name: category.name,
    parent: category.parent
      ? { value: category.parent.id, label: category.parent.name }
      : { value: null, label: t('blog:noParent') },
    urlAlias: category.urlAlias,

    pageTitle: category.pageTitle ?? '',
    pageDescription: category.pageDescription ?? '',
    pageKeywords: category.pageKeywords ?? '',
    openGraphTitle: category.openGraphTitle ?? '',
    openGraphDescription: category.openGraphDescription ?? '',
    openGraphImage: category.openGraphImage
      ? { id: createId(), file: category.openGraphImage }
      : null,
  };
}

export function convertCategoryFormValuesToPayload(
  values: CategoryFormValues
): CategoryPayload {
  return {
    language: values.language?.value ?? null,
    name: values.name,
    parent: values.parent.value,
    urlAlias: values.urlAlias,
    isDefault: values.isDefault,

    pageTitle: values.pageTitle,
    pageDescription: values.pageDescription,
    openGraphImage: values.openGraphImage?.file.id ?? null,
  };
}

export function convertCategoryListToOptions(
  categoryList: Category[],
  languageId: Nullable<string>,
  t: TFunction
): OptionType<Nullable<number>>[] {
  return [
    { value: null, label: t('blog:noParent') },
    ...categoryList
      .filter(({ language }) => (languageId ? language === languageId : true))
      .map(({ id, name, depth }) => ({
        value: id,
        label: getNameWithDepth(name, depth),
      })),
  ];
}
