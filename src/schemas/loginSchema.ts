import * as yup from 'yup';
import { emailSchema, passwordSchema } from './validators';

export const loginSchema = yup.object({
  email: emailSchema,
  password: passwordSchema,
});
