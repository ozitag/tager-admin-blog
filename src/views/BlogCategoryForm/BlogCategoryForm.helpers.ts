import { createId, Nullable } from '@tager/admin-services';
import { OptionType, SingleFileInputValueType } from '@tager/admin-ui';

import { BlogCategory } from '../../typings/model';
import {
  BlogCategoryCreationPayload,
  BlogCategoryUpdatePayload,
} from '../../services/requests';

export type CategoryFormValues = {
  name: string;
  pageTitle: string;
  pageDescription: string;
  openGraphImage: Nullable<SingleFileInputValueType>;
  urlAlias: string;
  language: Nullable<OptionType>;
};

export function convertCategoryToFormValues(
  category: Nullable<BlogCategory>,
  languageOptionList: Array<OptionType>
): CategoryFormValues {
  const currentLangOption = languageOptionList.find(
    (option) => option.value === category?.language
  );

  if (!category) {
    return {
      name: '',
      pageTitle: '',
      pageDescription: '',
      openGraphImage: null,
      urlAlias: '',
      language: currentLangOption ?? null,
    };
  }
  return {
    name: category.name,
    pageTitle: category.pageTitle ?? '',
    pageDescription: category.pageDescription ?? '',
    openGraphImage: category.openGraphImage
      ? { id: createId(), file: category.openGraphImage }
      : null,
    urlAlias: category.urlAlias,
    language: currentLangOption ?? null,
  };
}

export function convertCategoryFormValuesToCreationPayload(
  values: CategoryFormValues
): BlogCategoryCreationPayload {
  return {
    name: values.name,
    pageTitle: values.pageTitle,
    pageDescription: values.pageDescription,
    openGraphImage: values.openGraphImage?.file.id ?? null,
    language: values.language?.value ?? null,
  };
}

export function convertCategoryFormValuesToUpdatePayload(
  values: CategoryFormValues
): BlogCategoryUpdatePayload {
  return {
    ...convertCategoryFormValuesToCreationPayload(values),
    urlAlias: values.urlAlias,
  };
}
