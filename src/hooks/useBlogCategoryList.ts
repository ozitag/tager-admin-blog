import { onMounted, SetupContext } from '@vue/composition-api';

import { BlogCategory } from '../typings/model';
import { getBlogCategoryList } from '../services/requests';
import { ResourceRef, useResource } from '@tager/admin-services';

export function useBlogCategoryList(params: {
  context: SetupContext;
}): ResourceRef<Array<BlogCategory>> {
  const [fetchBlogCategoryList, resource] = useResource<Array<BlogCategory>>({
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

export default useBlogCategoryList;
