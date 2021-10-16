import { Store } from 'vuex';
import { SetupContext } from '@vue/composition-api';

import { RootState } from '@/store';

export function useStore(context: SetupContext): Store<RootState> {
  return context.root.$store;
}
