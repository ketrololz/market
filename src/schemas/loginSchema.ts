import * as yup from 'yup';
import { passwordSchema } from './passwordSchema';
import { emailSchema } from './emailSchema';

export const loginSchema = yup.object({
  email: emailSchema,
  password: passwordSchema,
});
