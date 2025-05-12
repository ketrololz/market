import * as yup from 'yup';

export const emailField = yup
  .string()
  .trim()
  .email('Invalid email format')
  .required('Email is required');

export const passwordField = yup
  .string()
  .required('Password is required')
  .min(8, 'Minimum 8 characters')
  .matches(/[A-Z]/, 'At least one uppercase letter')
  .matches(/[a-z]/, 'At least one lowercase letter')
  .matches(/\d/, 'At least one number')
  .matches(/[!@#$%^&*]/, 'At least one special character')
  .test(
    'no-whitespace',
    'No leading or trailing spaces allowed',
    (val) => val?.trim() === val,
  );
