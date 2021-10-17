import { onMounted, Ref, SetupContext, watch } from '@vue/composition-api';

import { Nullable, ResourceRef, useResource } from '@tager/admin-services';

import { Category } from '@/typings/model';
import { getCategory } from '@/services/requests';

export function useFetchCategory({
  context,
  categoryId,
  isCreation,
}: {
  context: SetupContext;
  categoryId: Ref<string>;
  isCreation: Ref<boolean>;
}): ResourceRef<Nullable<Category>> {
  const [fetchCategory, resource] = useResource<Nullable<Category>>({
    fetchResource: () => getCategory(categoryId.value),
    initialValue: null,
    context,
    resourceName: 'Blog category',
  });

  onMounted(() => {
    if (isCreation.value) {
      return;
    }

    fetchCategory();
  });

  watch(categoryId, () => {
    if (isCreation.value) {
      return;
    }

    fetchCategory();
  });

  return resource;
}
