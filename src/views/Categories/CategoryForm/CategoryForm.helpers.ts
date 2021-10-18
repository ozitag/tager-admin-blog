import { createId, Nullable } from '@tager/admin-services';
import { OptionType } from '@tager/admin-ui';

import {
  Category,
  CategoryFormValues,
  CategoryPayload,
} from '../../../typings/model';

export function convertCategoryToFormValues(
  category: Nullable<Category>,
  languageOptionList: OptionType[]
): CategoryFormValues {
  const currentLangOption = languageOptionList.find(
    ({ value }) => value === category?.language
  );

  if (!category) {
    return {
      language: currentLangOption ?? null,
      name: '',
      parent: null,
      urlAlias: '',

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
    name: category.name,
    parent: category.parent
      ? { value: category.parent.id, label: category.parent.name }
      : null,
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
    parent: values.parent?.value ?? null,
    urlAlias: values.urlAlias,
    isDefault: false,

    pageTitle: values.pageTitle,
    pageDescription: values.pageDescription,
    openGraphImage: values.openGraphImage?.file.id ?? null,
  };
}
