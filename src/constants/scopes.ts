export const Scope = {
  All: '*',
  OrdersCreate: 'orders.create',
  OrdersView: 'orders.view',
  OrdersDelete: 'orders.delete',
  RbacViewRoles: 'rbac.view-roles',
  RbacEditRoles: 'rbac.edit-roles',
  AdministratorsView: 'administrators.view',
  AdministratorsEdit: 'administrators.edit',
  AdministratorsDelete: 'administrators.delete',
} as const;
