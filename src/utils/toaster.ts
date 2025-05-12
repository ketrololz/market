import { useToast } from 'vue-toastification';

const toast = useToast();

export function showErrorToast(message: string, title?: string): void {
  toast.error(message, {});
  if (title) console.error(title, message);
  else console.error(message);
}

export function showSuccessToast(message: string, title?: string): void {
  toast.success(message, {});
  if (title) console.log(title, message);
  else console.log(message);
}

export function showInfoToast(message: string, title?: string): void {
  toast.info(message, {});
  if (title) console.info(title, message);
  else console.info(message);
}

export function showWarningToast(message: string, title?: string): void {
  toast.warning(message, {});
  if (title) console.warn(title, message);
  else console.warn(message);
}
