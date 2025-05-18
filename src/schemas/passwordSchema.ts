import * as yup from 'yup';

export const passwordSchema = yup
  .string()
  .min(8, 'Minimum 8 characters')
  .matches(/[A-Z]/, 'At least one uppercase letter')
  .matches(/[a-z]/, 'At least one lowercase letter')
  .matches(/\d/, 'At least one number')
  .matches(
    /[!@#$%^&*()\-_=+|{}[\]:;'",.<>?/]/,
    'At least one special character',
  )
  .required('Password is required')
  .test(
    'no-whitespace',
    'No leading or trailing spaces allowed',
    (val) => val?.trim() === val,
  );
