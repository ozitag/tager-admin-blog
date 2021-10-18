import { computed, ComputedRef, SetupContext } from '@vue/composition-api';

import { ScopeType } from '../typings/model';
import { useStore } from '../hooks';
import { userNamespace } from '../utils/common';

export function useUserPermission(
  context: SetupContext,
  scope: ScopeType
): ComputedRef<boolean> {
  const store = useStore(context);

  return computed<boolean>(() => {
    return store.getters[userNamespace('userHasPermission')](scope);
  });
}
