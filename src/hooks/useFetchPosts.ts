import { onMounted, SetupContext } from '@vue/composition-api';

import { ResourceRef, useResource } from '@tager/admin-services';

import { PostShort } from '@/typings/model';
import { getPosts } from '@/services/requests';

export function useFetchPosts(params: {
  context: SetupContext;
}): ResourceRef<PostShort[]> {
  const [fetchPosts, resource] = useResource<PostShort[]>({
    fetchResource: () => getPosts({ pageNumber: 1, pageSize: 99999 }),
    initialValue: [],
    context: params.context,
    resourceName: 'Blog posts',
  });

  onMounted(() => {
    fetchPosts();
  });

  return resource;
}
