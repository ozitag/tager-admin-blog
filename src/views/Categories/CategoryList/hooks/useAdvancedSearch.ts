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
  getFilterParamAsStringArray,
  getFilterParams,
  OptionType,
} from '@tager/admin-ui';

import { Language } from '@/typings/model';

interface Params {
  context: SetupContext;
  languageList: ComputedRef<Language[]>;
}

interface State {
  languageFilter: Ref<OptionType[]>;
  languageOptionList: ComputedRef<OptionType[]>;
  filterParams: ComputedRef<Record<string, string | string[]>>;
  tags: ComputedRef<FilterTagType[]>;
  tagRemovalHandler(event: FilterTagType): void;
}

enum FilterTypes {
  LANGUAGE = 'language',
}

export function useAdvancedSearch({ context, languageList }: Params): State {
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

  /** Params **/

  const filterParams = computed(() =>
    getFilterParams({
      [FilterTypes.LANGUAGE]: languageFilter.value.map(({ value }) => value),
    })
  );

  /** Tag removal handler **/

  function tagRemovalHandler(event: FilterTagType) {
    if (event.name === FilterTypes.LANGUAGE) {
      languageFilter.value = languageFilter.value.filter(
        ({ value }) => value !== event.value
      );
    }
  }

  /** Tags **/

  const tags = computed<FilterTagType[]>(() => [
    ...languageFilter.value.map(({ value, label }) => ({
      value,
      label,
      name: FilterTypes.LANGUAGE,
      title: context.root.$t('blog:language'),
    })),
  ]);

  return {
    languageFilter,
    languageOptionList,
    tagRemovalHandler,
    tags: tags,
    filterParams,
  };
}
