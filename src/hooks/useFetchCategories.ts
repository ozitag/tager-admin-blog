import { onMounted } from 'vue';

import { type ResourceRef, useResource } from '@tager/admin-services';

import { type Category } from '../typings/model';
import { getCategories } from '../services/requests';

export function useFetchCategories(): ResourceRef<Category[]> {
  const [fetchCategories, resource] = useResource<Category[]>({
    fetchResource: getCategories,
    initialValue: [],
    resourceName: 'Blog categories',
  });

  onMounted(() => {
    fetchCategories();
  });

  return resource;
}
