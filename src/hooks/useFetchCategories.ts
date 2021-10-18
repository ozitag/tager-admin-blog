import { onMounted, SetupContext } from '@vue/composition-api';

import { ResourceRef, useResource } from '@tager/admin-services';

import { Category } from '../typings/model';
import { getCategories } from '../services/requests';

export function useFetchCategories({
  context,
}: {
  context: SetupContext;
}): ResourceRef<Category[]> {
  const [fetchCategories, resource] = useResource<Category[]>({
    fetchResource: getCategories,
    initialValue: [],
    context,
    resourceName: 'Blog categories',
  });

  onMounted(() => {
    fetchCategories();
  });

  return resource;
}
