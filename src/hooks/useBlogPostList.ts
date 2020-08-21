import { onMounted, SetupContext } from '@vue/composition-api';
import { ResourceRef, useResource } from '@tager/admin-services';

import { PostShort } from '../typings/model';
import { getBlogPostList } from '../services/requests';

export function useBlogPostList(params: {
  context: SetupContext;
}): ResourceRef<Array<PostShort>> {
  const [fetchBlogPostList, resource] = useResource<Array<PostShort>>({
    fetchResource: getBlogPostList,
    initialValue: [],
    context: params.context,
    resourceName: 'Blog post list',
  });

  onMounted(() => {
    fetchBlogPostList();
  });

  return resource;
}

export default useBlogPostList;
