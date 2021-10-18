import {
  computed,
  ComputedRef,
  Ref,
  ref,
  SetupContext,
  watch,
} from '@vue/composition-api';

import {
  FilterTagType,
  getFilterParamAsString,
  getFilterParamAsStringArray,
  getFilterParams,
  OptionType,
} from '@tager/admin-ui';
import { isNotNullish } from '@tager/admin-services';

import { Category, Language } from '../../../../typings/model';
import { getNameWithDepth } from '../../../../utils/common';

interface Params {
  context: SetupContext;
  categoryList: ComputedRef<Category[]>;
  languageList: ComputedRef<Language[]>;
}

interface State {
  categoryFilter: Ref<OptionType[]>;
  categoryOptionList: ComputedRef<OptionType[]>;
  languageFilter: Ref<OptionType[]>;
  languageOptionList: ComputedRef<OptionType[]>;
  fromDateFilter: Ref<string>;
  toDateFilter: Ref<string>;
  filterParams: ComputedRef<Record<string, string | string[]>>;
  tags: ComputedRef<FilterTagType[]>;
  tagRemovalHandler(event: FilterTagType): void;
}

enum FilterTypes {
  CATEGORY = 'category',
  LANGUAGE = 'language',
  FROM_DATE = 'from-date',
  TO_DATE = 'to-date',
}

export const dateFormat = (date: string) => date.split('-').reverse().join('.');

export function useAdvancedSearch({
  context,
  categoryList,
  languageList,
}: Params): State {
  /** Category **/

  const categoryOptionList = computed<OptionType[]>(() =>
    categoryList.value.map(({ id, name, depth }) => ({
      value: String(id),
      label: getNameWithDepth(name, depth),
    }))
  );

  const initialCategoryFilter = computed<OptionType[]>(() => {
    const queryValue = getFilterParamAsStringArray(
      context.root.$route.query,
      FilterTypes.CATEGORY
    );
    return categoryOptionList.value.filter(({ value }) =>
      queryValue.some((selected) => selected === value)
    );
  });

  const categoryFilter = ref<OptionType[]>(initialCategoryFilter.value);

  watch(initialCategoryFilter, () => {
    categoryFilter.value = initialCategoryFilter.value;
  });

  /** Language **/

  const languageOptionList = computed<OptionType[]>(() =>
    languageList.value.map(({ id, name }) => ({ value: id, label: name }))
  );

  const initialLanguageFilter = computed<OptionType[]>(() => {
    const queryValue = getFilterParamAsStringArray(
      context.root.$route.query,
      FilterTypes.LANGUAGE
    );
    return languageOptionList.value.filter(({ value }) =>
      queryValue.some((selected) => selected === value)
    );
  });

  const languageFilter = ref<OptionType[]>(initialLanguageFilter.value);

  watch(initialLanguageFilter, () => {
    languageFilter.value = initialLanguageFilter.value;
  });

  /** From date **/

  const initialFromDateFilter = computed<string>(
    () =>
      getFilterParamAsString(
        context.root.$route.query,
        FilterTypes.FROM_DATE
      ) ?? ''
  );

  const fromDateFilter = ref<string>(initialFromDateFilter.value);

  watch(initialFromDateFilter, () => {
    fromDateFilter.value = initialFromDateFilter.value;
  });

  /** To date **/

  const initialToDateFilter = computed<string>(
    () =>
      getFilterParamAsString(context.root.$route.query, FilterTypes.TO_DATE) ??
      ''
  );

  const toDateFilter = ref<string>(initialToDateFilter.value);

  watch(initialToDateFilter, () => {
    toDateFilter.value = initialToDateFilter.value;
  });

  /** Date **/

  const date = computed<FilterTagType | null>(() => {
    if (!fromDateFilter.value && !toDateFilter.value) {
      return null;
    }

    let label = '';

    if (fromDateFilter.value && toDateFilter.value) {
      label = `${dateFormat(fromDateFilter.value)} - ${dateFormat(
        toDateFilter.value
      )}`;
    }

    if (fromDateFilter.value && !toDateFilter.value) {
      label = `${context.root.$t('blog:from')} ${dateFormat(
        fromDateFilter.value
      )}`;
    }

    if (!fromDateFilter.value && toDateFilter.value) {
      label = `${context.root.$t('blog:to')} ${dateFormat(toDateFilter.value)}`;
    }

    return {
      value: '',
      label,
      name: FilterTypes.FROM_DATE,
      title: context.root.$t('blog:dateOfPublication'),
    };
  });

  /** Params **/

  const filterParams = computed(() => {
    const filters: Record<string, string | string[]> = {
      [FilterTypes.CATEGORY]: categoryFilter.value.map(({ value }) => value),
      [FilterTypes.LANGUAGE]: languageFilter.value.map(({ value }) => value),
    };

    if (fromDateFilter.value) {
      filters[FilterTypes.FROM_DATE] = fromDateFilter.value;
    }

    if (toDateFilter.value) {
      filters[FilterTypes.TO_DATE] = toDateFilter.value;
    }

    return getFilterParams(filters);
  });

  /** Tag removal handler **/

  function tagRemovalHandler(event: FilterTagType) {
    if (event.name === FilterTypes.CATEGORY) {
      categoryFilter.value = categoryFilter.value.filter(
        ({ value }) => value !== event.value
      );
    }
    if (event.name === FilterTypes.LANGUAGE) {
      languageFilter.value = languageFilter.value.filter(
        ({ value }) => value !== event.value
      );
    }
    if (event.name === FilterTypes.FROM_DATE) {
      fromDateFilter.value = '';
      toDateFilter.value = '';
    }
  }

  /** Tags **/

  const tags = computed<FilterTagType[]>(() =>
    [
      ...categoryFilter.value.map(({ value, label }) => ({
        value,
        label,
        name: FilterTypes.CATEGORY,
        title: context.root.$t('blog:category'),
      })),
      ...languageFilter.value.map(({ value, label }) => ({
        value,
        label,
        name: FilterTypes.LANGUAGE,
        title: context.root.$t('blog:language'),
      })),
      date.value,
    ].filter(isNotNullish)
  );

  /** Helpers **/

  const selectedCategoryOptionList = computed<OptionType[]>(() => {
    if (languageFilter.value.length === 0) {
      return categoryOptionList.value;
    }

    const selectedList = categoryList.value.filter(({ language }) =>
      languageFilter.value.some(({ value }) => value === language)
    );

    return selectedList.map(({ id, name, depth }) => ({
      value: String(id),
      label: getNameWithDepth(name, depth),
    }));
  });

  return {
    categoryFilter,
    categoryOptionList: selectedCategoryOptionList,
    languageFilter,
    languageOptionList,
    fromDateFilter,
    toDateFilter,
    tagRemovalHandler,
    tags: tags,
    filterParams,
  };
}
