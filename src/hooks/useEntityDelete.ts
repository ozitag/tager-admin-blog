import { ref, SetupContext } from '@vue/composition-api';

type EntityId = string | number;

function useEntityDelete(params: {
  deleteEntity: (entityId: EntityId) => Promise<{ success: boolean }>;
  entityName: string;
  onSuccess?: () => void;
  context: SetupContext;
}) {
  const deletingEntityIdList = ref<Array<EntityId>>([]);

  function handleEntityDelete(entityId: EntityId) {
    const shouldDeleteEntity = confirm(
      `Are you sure you want to delete ${params.entityName.toLowerCase()}?`
    );

    if (shouldDeleteEntity) {
      deletingEntityIdList.value.push(entityId);

      params
        .deleteEntity(entityId)
        .then((response) => {
          if (response.success) {
            deletingEntityIdList.value.filter((id) => id !== entityId);

            if (params.onSuccess) {
              params.onSuccess();
            }

            params.context.root.$toast({
              variant: 'success',
              title: 'Success',
              body: `${params.entityName} has been successfully removed`,
            });
          } else {
            params.context.root.$toast({
              variant: 'danger',
              title: 'Error',
              body: `${params.entityName} deletion has been failed`,
            });
          }
        })
        .catch((error) => {
          console.error(error);
          params.context.root.$toast({
            variant: 'danger',
            title: 'Error',
            body: `${params.entityName} deletion has been failed`,
          });
        });
    }
  }

  return {
    handleEntityDelete,
    isDeleting: (entityId: EntityId) =>
      deletingEntityIdList.value.includes(entityId),
  };
}

export default useEntityDelete;
