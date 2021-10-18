import { USER_MODULE_NAMESPACE } from '../store/user';

export function namespace(namespace: string, name: string): string {
  return `${namespace}/${name}`;
}

export function userNamespace(name: string): string {
  return namespace(USER_MODULE_NAMESPACE, name);
}

export function generateNumberArray(length: number): Array<number> {
  return Array.from({ length }, (_, index) => index);
}

export function getNameWithDepth(name: string, depth: number): string {
  return (
    generateNumberArray(depth)
      .map(() => '—')
      .join(' ') +
    ' ' +
    name
  );
}
