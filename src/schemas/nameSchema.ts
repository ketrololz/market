import * as yup from 'yup';

export const nameSchema = yup
  .string()
  .trim()
  .min(1, 'Minimum 1 character')
  .matches(/^[A-Za-zА-Яа-яёЁ0-9]+$/, 'Only letters and numbers are allowed');
