import { USER_MODULE_NAMESPACE } from '@/store/user';

export function namespace(namespace: string, name: string): string {
  return `${namespace}/${name}`;
}

export function userNamespace(name: string): string {
  return namespace(USER_MODULE_NAMESPACE, name);
}
