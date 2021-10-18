import { GetterTree, Module } from 'vuex';

import { FETCH_STATUSES, FetchStatus } from '@tager/admin-services';

import { ScopeType, UserModel } from '../typings/model';
import { getUserProfile } from '../services/requests';
import { Scope } from '../constants/scopes';

import { RootState } from './index';

export interface UserModuleStateModel {
  profile: UserModel | null;
  status: FetchStatus;
}

export const USER_MODULE_NAMESPACE = 'user';

const USER_MUTATION_TYPES = {
  PROFILE_REQUEST_STARTED: 'profileRequestStarted',
  PROFILE_REQUEST_FULFILLED: 'profileRequestFulfilled',
  PROFILE_REQUEST_REJECTED: 'profileRequestRejected',
};

export const USER_ACTION_TYPES = {
  FETCH_USER_PROFILE: 'fetchUserProfile',
} as const;

type ReturnValueMapType<
  T extends { [key: string]: (...args: any[]) => any }
> = { [key in keyof T]: ReturnType<T[key]> };

interface UserGettersType extends GetterTree<UserModuleStateModel, RootState> {
  userScopes: (state: UserModuleStateModel) => Array<ScopeType>;
  userHasPermission: (
    state: UserModuleStateModel,
    getters: ReturnValueMapType<UserGettersType>
  ) => (scope: ScopeType) => boolean;
}

const userGetters: UserGettersType = {
  userProfile(state) {
    return state.profile;
  },
  userScopes(state) {
    const roles = state.profile ? state.profile.roles : [];
    const scopes: Array<ScopeType> = [];

    roles.forEach((role) => {
      scopes.push(...role.scopes);
    });

    return scopes;
  },
  userHasPermission: (state, getters) => (scope: ScopeType) => {
    const scopes = getters.userScopes;

    if (scopes.includes(Scope.All)) return true;

    return scopes.includes(scope);
  },
};

const userModule: Module<UserModuleStateModel, RootState> = {
  namespaced: true,
  state: {
    profile: null,
    status: FETCH_STATUSES.IDLE,
  },
  mutations: {
    [USER_MUTATION_TYPES.PROFILE_REQUEST_STARTED](state) {
      if (state.status === FETCH_STATUSES.IDLE) {
        state.status = FETCH_STATUSES.LOADING;
      }
    },
    [USER_MUTATION_TYPES.PROFILE_REQUEST_FULFILLED](state, user: UserModel) {
      if (state.status === FETCH_STATUSES.LOADING) {
        state.status = FETCH_STATUSES.SUCCESS;
        state.profile = user;
      }
    },
    [USER_MUTATION_TYPES.PROFILE_REQUEST_REJECTED](state) {
      if (state.status === FETCH_STATUSES.LOADING) {
        state.status = FETCH_STATUSES.FAILURE;
        state.profile = null;
      }
    },
  },
  actions: {
    [USER_ACTION_TYPES.FETCH_USER_PROFILE](store) {
      if (store.state.status !== FETCH_STATUSES.IDLE) return;

      store.commit(USER_MUTATION_TYPES.PROFILE_REQUEST_STARTED);

      getUserProfile()
        .then((response) => {
          store.commit(
            USER_MUTATION_TYPES.PROFILE_REQUEST_FULFILLED,
            response.data
          );
        })
        .catch((error) => {
          console.error(error);
          store.commit(USER_MUTATION_TYPES.PROFILE_REQUEST_REJECTED);
        });
    },
  },
  getters: userGetters,
};

export default userModule;
