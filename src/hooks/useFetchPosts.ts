import { onMounted } from 'vue';

import { ResourceRef, useResource } from '@tager/admin-services';

import { PostShort } from '../typings/model';
import { getPosts } from '../services/requests';

export function useFetchPosts(): ResourceRef<PostShort[]> {
  const [fetchPosts, resource] = useResource<PostShort[]>({
    fetchResource: () => getPosts({ pageNumber: 1, pageSize: 99999 }),
    initialValue: [],
    resourceName: 'Blog posts',
  });

  onMounted(() => {
    fetchPosts();
  });

  return resource;
}
