import { describe, it, expect, beforeEach } from 'vitest';
import { nextTick } from 'vue';
import { useDialogManager } from './useDialogManager';

describe('useDialogManager', () => {
  let dialogManager: ReturnType<typeof useDialogManager>;

  beforeEach(() => {
    dialogManager = useDialogManager();
  });

  it('initially no active dialog', () => {
    expect(dialogManager.activeDialog.value).toBeNull();
    expect(dialogManager.isProfileDialogVisible.value).toBe(false);
    expect(dialogManager.isAddressDialogVisible.value).toBe(false);
    expect(dialogManager.isPasswordDialogVisible.value).toBe(false);
  });

  it('openDialog sets activeDialog and isEditMode correctly', () => {
    dialogManager.openDialog('profile', true);
    expect(dialogManager.activeDialog.value).toBe('profile');
    expect(dialogManager.isProfileDialogVisible.value).toBe(true);
    expect(dialogManager.isAddressDialogVisible.value).toBe(false);
    expect(dialogManager.isPasswordDialogVisible.value).toBe(false);

    dialogManager.openDialog('address', false);
    expect(dialogManager.activeDialog.value).toBe('address');
    expect(dialogManager.isAddressDialogVisible.value).toBe(true);
    expect(dialogManager.isProfileDialogVisible.value).toBe(false);
  });

  it('closeDialog resets activeDialog', () => {
    dialogManager.openDialog('password');
    expect(dialogManager.activeDialog.value).toBe('password');
    dialogManager.closeDialog();
    expect(dialogManager.activeDialog.value).toBeNull();
    expect(dialogManager.isPasswordDialogVisible.value).toBe(false);
  });

  it('createDialogVisibility setter updates activeDialog', async () => {
    const { isProfileDialogVisible } = dialogManager;
    isProfileDialogVisible.value = true;
    await nextTick();
    expect(dialogManager.activeDialog.value).toBe('profile');

    isProfileDialogVisible.value = false;
    await nextTick();
    expect(dialogManager.activeDialog.value).toBeNull();
  });

  it('isEditMode updates correctly on openDialog', () => {
    dialogManager.openDialog('profile', true);
    expect(dialogManager.isEditMode.value).toBe(true);

    dialogManager.openDialog('address', false);
    expect(dialogManager.isEditMode.value).toBe(false);
  });
});
