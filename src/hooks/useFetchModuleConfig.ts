import { onMounted } from 'vue';

import { Nullable, ResourceRef, useResource } from '@tager/admin-services';

import { ModuleConfig } from '../typings/model';
import { getModuleConfig } from '../services/requests';

export function useFetchModuleConfig(): ResourceRef<Nullable<ModuleConfig>> {
  const [fetchModuleConfig, resource] = useResource<Nullable<ModuleConfig>>({
    fetchResource: getModuleConfig,
    initialValue: null,
    resourceName: 'Module configuration',
  });

  onMounted(() => {
    fetchModuleConfig();
  });

  return resource;
}
