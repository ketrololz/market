import * as yup from 'yup';
import { addressSchema } from './addressSchema';
import { emailSchema } from './emailSchema';
import { passwordSchema } from './passwordSchema';
import { nameSchema } from './nameSchema';
import { dateSchema } from './dateSchema';

export const registrationSchema = yup.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: nameSchema,
  lastName: nameSchema,
  dateOfBirth: dateSchema,
  sameAsShipping: yup.boolean(),
  shippingAddress: addressSchema,
  billingAddress: addressSchema,
});
