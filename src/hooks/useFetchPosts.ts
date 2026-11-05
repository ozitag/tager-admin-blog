import { onMounted } from 'vue';

import { type ResourceRef, useResource } from '@tager/admin-services';

import { type PostShort } from '../typings/model';
import { getPosts } from '../services/requests';

export function useFetchPosts(): ResourceRef<PostShort[]> {
  const [fetchPosts, resource] = useResource<PostShort[]>({
    fetchResource: () =>
      getPosts({ pageNumber: 1, pageSize: 99999, sort: 'status' }),
    initialValue: [],
    resourceName: 'Blog posts',
  });

  onMounted(() => {
    fetchPosts();
  });

  return resource;
}
