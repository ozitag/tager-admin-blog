import { onMounted, SetupContext } from '@vue/composition-api';

import { ResourceRef, useResource } from '@tager/admin-services';

import { PostShort } from '../typings/model';
import { getBlogPostList } from '../services/requests';

export function useBlogPostList(params: {
  context: SetupContext;
}): ResourceRef<PostShort[]> {
  const [fetchBlogPostList, resource] = useResource<PostShort[]>({
    fetchResource: () => getBlogPostList({ pageNumber: 1, pageSize: 99999 }),
    initialValue: [],
    context: params.context,
    resourceName: 'Blog post list',
  });

  onMounted(() => {
    fetchBlogPostList();
  });

  return resource;
}
