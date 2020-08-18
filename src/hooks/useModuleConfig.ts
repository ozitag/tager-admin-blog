import { onMounted, SetupContext } from '@vue/composition-api';
import useResource, { ResourceRef } from './useResource';
import { Nullable } from '@tager/admin-services';
import { BlogModuleConfigType } from '../typings/model';
import { getBlogModuleConfig } from '../services/requests';

export function useModuleConfig(params: {
  context: SetupContext;
}): ResourceRef<Nullable<BlogModuleConfigType>> {
  const [fetchModuleConfig, resource] = useResource<
    Nullable<BlogModuleConfigType>
  >({
    fetchResource: getBlogModuleConfig,
    initialValue: null,
    context: params.context,
    resourceName: 'Module configuration',
  });

  onMounted(() => {
    fetchModuleConfig();
  });

  return resource;
}

export default useModuleConfig;
