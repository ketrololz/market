import * as yup from 'yup';

const emailRegex = /^[a-zA-Z0-9]+@[a-zA-Z]+\.[a-zA-Z]+$/;

export const emailSchema = yup
  .string()
  .trim()
  .matches(emailRegex, 'Invalid email format')
  .required('Email is required');
