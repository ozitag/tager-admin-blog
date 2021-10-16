import { onMounted, SetupContext } from '@vue/composition-api';

import { Nullable, ResourceRef, useResource } from '@tager/admin-services';

import { ModuleConfig } from '@/typings/model';
import { getBlogModuleConfig } from '@/services/requests';

export function useModuleConfig(params: {
  context: SetupContext;
}): ResourceRef<Nullable<ModuleConfig>> {
  const [fetchModuleConfig, resource] = useResource<Nullable<ModuleConfig>>({
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
