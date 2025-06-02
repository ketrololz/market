import { computed, ref } from 'vue';

type DialogName = 'profile' | 'address' | 'password' | null;

const activeDialog = ref<DialogName>(null);

function createDialogVisibility(dialog: Exclude<DialogName, null>) {
  return computed({
    get: () => activeDialog.value === dialog,
    set: (val: boolean) => {
      activeDialog.value = val ? dialog : null;
    },
  });
}

function openDialog(dialog: Exclude<DialogName, null>) {
  activeDialog.value = dialog;
}

function closeDialog() {
  activeDialog.value = null;
}

export function useDialogManager() {
  return {
    activeDialog,
    openDialog,
    closeDialog,
    isProfileDialogVisible: createDialogVisibility('profile'),
    isAddressDialogVisible: createDialogVisibility('address'),
    isPasswordDialogVisible: createDialogVisibility('password'),
  };
}
