import * as yup from 'yup';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const emailSchema = yup
  .string()
  .trim()
  .matches(emailRegex, 'Invalid email format')
  .required('Email is required');
