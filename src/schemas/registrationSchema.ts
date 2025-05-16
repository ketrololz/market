import * as yup from 'yup';
import {
  emailSchema,
  passwordSchema,
  nameSchema,
  dateSchema,
  // addressSchema,
} from './validators';

export const registrationSchema = yup.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: nameSchema,
  lastName: nameSchema,
  dateOfBirth: dateSchema,
  // address: addressSchema,
});
