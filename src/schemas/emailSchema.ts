import * as yup from 'yup';

const emailRegex = /^[a-zA-Z0-9]+@[a-zA-Z]+\.[a-zA-Z]+$/;

export const emailSchema = yup
  .string()

  .required('Email is required')
  .test(
    'no-whitespace',
    'No leading or trailing spaces allowed',
    (val) => val?.trim() === val,
  )
  .matches(emailRegex, 'Invalid email format');
