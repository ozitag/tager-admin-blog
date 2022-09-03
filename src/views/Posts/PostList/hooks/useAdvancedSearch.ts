import { computed, ComputedRef, Ref, ref, watch } from 'vue';
import { TFunction } from 'i18next';
import { RouteLocationNormalizedLoaded } from 'vue-router';

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
  categoryList: Ref<Category[]>;
  languageList: ComputedRef<Language[]>;
  statusOptionList: ComputedRef<OptionType[]>;

  t: TFunction;
  route: RouteLocationNormalizedLoaded;
}

interface State {
  categoryFilter: Ref<OptionType[]>;
  categoryOptionList: ComputedRef<OptionType[]>;
  languageFilter: Ref<OptionType[]>;
  languageOptionList: ComputedRef<OptionType[]>;
  fromDateFilter: Ref<string>;
  toDateFilter: Ref<string>;
  statusFilter: Ref<OptionType[]>;
  filterParams: ComputedRef<Record<string, string | string[]>>;
  tags: ComputedRef<FilterTagType[]>;

  tagRemovalHandler(event: FilterTagType): void;
}

enum FilterTypes {
  CATEGORY = 'category',
  LANGUAGE = 'language',
  FROM_DATE = 'from-date',
  TO_DATE = 'to-date',
  STATUS = 'status',
}

export const dateFormat = (date: string) => date.split('-').reverse().join('.');

export function useAdvancedSearch({
  t,
  route,
  categoryList,
  languageList,
  statusOptionList,
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
      route.query,
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
      route.query,
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
    () => getFilterParamAsString(route.query, FilterTypes.FROM_DATE) ?? ''
  );

  const fromDateFilter = ref<string>(initialFromDateFilter.value);

  watch(initialFromDateFilter, () => {
    fromDateFilter.value = initialFromDateFilter.value;
  });

  /** To date **/

  const initialToDateFilter = computed<string>(
    () => getFilterParamAsString(route.query, FilterTypes.TO_DATE) ?? ''
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
      label = `${t('blog:from')} ${dateFormat(fromDateFilter.value)}`;
    }

    if (!fromDateFilter.value && toDateFilter.value) {
      label = `${t('blog:to')} ${dateFormat(toDateFilter.value)}`;
    }

    return {
      value: '',
      label,
      name: FilterTypes.FROM_DATE,
      title: t('blog:dateOfPublication'),
    };
  });

  /** Status **/

  const initialStatusFilter = computed<OptionType[]>(() => {
    const queryValue = getFilterParamAsStringArray(
      route.query,
      FilterTypes.STATUS
    );
    return statusOptionList.value.filter(({ value }) =>
      queryValue.some((selected) => selected === value)
    );
  });

  const statusFilter = ref<OptionType[]>(initialStatusFilter.value);

  watch(initialStatusFilter, () => {
    statusFilter.value = initialStatusFilter.value;
  });

  /** Params **/

  const filterParams = computed(() => {
    const filters: Record<string, string | string[]> = {
      [FilterTypes.CATEGORY]: categoryFilter.value.map(({ value }) => value),
      [FilterTypes.LANGUAGE]: languageFilter.value.map(({ value }) => value),
      [FilterTypes.STATUS]: statusFilter.value.map(({ value }) => value),
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
    if (event.name === FilterTypes.STATUS) {
      statusFilter.value = statusFilter.value.filter(
        ({ value }) => value !== event.value
      );
    }
  }

  /** Tags **/

  const tags = computed<FilterTagType[]>(() =>
    [
      ...categoryFilter.value.map(({ value, label }) => ({
        value,
        label,
        name: FilterTypes.CATEGORY,
        title: t('blog:category'),
      })),
      ...languageFilter.value.map(({ value, label }) => ({
        value,
        label,
        name: FilterTypes.LANGUAGE,
        title: t('blog:language'),
      })),
      date.value,
      ...statusFilter.value.map(({ value, label }) => ({
        value,
        label,
        name: FilterTypes.STATUS,
        title: t('blog:status'),
      })),
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
    statusFilter,
    tagRemovalHandler,
    tags: tags,
    filterParams,
  };
}
