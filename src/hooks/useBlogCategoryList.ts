import { onMounted, SetupContext } from '@vue/composition-api';

import { ResourceRef, useResource } from '@tager/admin-services';

import { Category } from '../typings/model';
import { getBlogCategoryList } from '../services/requests';

export function useBlogCategoryList(params: {
  context: SetupContext;
}): ResourceRef<Category[]> {
  const [fetchBlogCategoryList, resource] = useResource<Category[]>({
    fetchResource: getBlogCategoryList,
    initialValue: [],
    context: params.context,
    resourceName: 'Blog category list',
  });

  onMounted(() => {
    fetchBlogCategoryList();
  });

  return resource;
}
