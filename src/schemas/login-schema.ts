import * as yup from 'yup'
import { emailField, passwordField } from './common-fields'

export const loginSchema = yup.object({
  email: emailField,
  password: passwordField
})