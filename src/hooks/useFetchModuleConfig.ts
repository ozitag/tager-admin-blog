import { onMounted, SetupContext } from '@vue/composition-api';

import { Nullable, ResourceRef, useResource } from '@tager/admin-services';

import { ModuleConfig } from '@/typings/model';
import { getModuleConfig } from '@/services/requests';

export function useFetchModuleConfig({
  context,
}: {
  context: SetupContext;
}): ResourceRef<Nullable<ModuleConfig>> {
  const [fetchModuleConfig, resource] = useResource<Nullable<ModuleConfig>>({
    fetchResource: getModuleConfig,
    initialValue: null,
    context: context,
    resourceName: 'Module configuration',
  });

  onMounted(() => {
    fetchModuleConfig();
  });

  return resource;
}
