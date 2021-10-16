import { computed, ComputedRef, SetupContext } from '@vue/composition-api';

import { UserModel } from '@/typings/model';
import { useStore } from '@/hooks/useStore';
import { userNamespace } from '@/utils/common';

export function useUserProfile(context: SetupContext): ComputedRef<UserModel> {
  const store = useStore(context);

  return computed<UserModel>(() => {
    return store.getters[userNamespace('userProfile')];
  });
}
