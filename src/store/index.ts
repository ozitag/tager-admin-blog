import Vue from 'vue';
import Vuex from 'vuex';

import userModule, {
  USER_MODULE_NAMESPACE,
  UserModuleStateModel,
} from '@/store/user';

Vue.use(Vuex);

export interface RootState {
  user: UserModuleStateModel;
}

const store = new Vuex.Store({
  modules: {
    [USER_MODULE_NAMESPACE]: userModule,
  },
});

export default store;
