import { useToast } from 'vue-toastification';
import appLogger from './logger';

const toast = useToast();

export function showErrorToast(message: string, title?: string): void {
  toast.error(message, {});
  if (title) appLogger.error(title, message);
  else appLogger.error(message);
}

export function showSuccessToast(message: string, title?: string): void {
  toast.success(message, {});
  if (title) appLogger.log(title, message);
  else appLogger.log(message);
}

export function showInfoToast(message: string, title?: string): void {
  toast.info(message, {});
  if (title) appLogger.info(title, message);
  else appLogger.info(message);
}

export function showWarningToast(message: string, title?: string): void {
  toast.warning(message, {});
  if (title) appLogger.warn(title, message);
  else appLogger.warn(message);
}
