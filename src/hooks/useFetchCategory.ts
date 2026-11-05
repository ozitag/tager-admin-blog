import { onMounted, type Ref, watch } from 'vue';

import { type Nullable, type ResourceRef, useResource } from '@tager/admin-services';

import { type Category } from '../typings/model';
import { getCategory } from '../services/requests';

export function useFetchCategory({
  categoryId,
  isCreation,
}: {
  categoryId: Ref<string>;
  isCreation: Ref<boolean>;
}): ResourceRef<Nullable<Category>> {
  const [fetchCategory, resource] = useResource<Nullable<Category>>({
    fetchResource: () => getCategory(categoryId.value),
    initialValue: null,
    resourceName: 'Blog category',
  });

  onMounted(() => {
    if (isCreation.value || !categoryId.value) {
      return;
    }

    fetchCategory();
  });

  watch(categoryId, () => {
    if (isCreation.value || !categoryId.value) {
      return;
    }

    fetchCategory();
  });

  return resource;
}
