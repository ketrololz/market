export interface InputFieldProps {
  modelValue: string | Date | null;
  placeholder?: string;
  errorMessage?: string | { message: string };
  icon?: string;
  showIconField?: boolean;
  showIcon?: boolean;
  inputId?: string;
  readonly?: boolean;
}
