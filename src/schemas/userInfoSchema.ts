import * as yup from 'yup';
import { emailSchema } from './emailSchema';
import { nameSchema } from './nameSchema';
import { dateSchema } from './dateSchema';

export const userInfoSchema = yup.object({
  email: emailSchema,
  firstName: nameSchema,
  lastName: nameSchema,
  dateOfBirth: dateSchema,
});
