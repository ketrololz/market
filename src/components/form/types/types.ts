export interface InputFieldProps {
  modelValue: string | Date | null;
  placeholder?: string;
  id?: string;
  errorMessage?: string | { message: string };
  label?: string;
  icon?: string;
  showIconField?: boolean;
  showIcon?: boolean;
}
