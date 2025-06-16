import * as yup from 'yup';

export const nameSchema = yup
  .string()
  .trim()
  .min(1, 'Minimum 1 character')
  .max(50, 'Maximum 50 characters')
  .matches(/^[A-Za-zА-Яа-яёЁ\s]+$/, 'Only letters and spaces are allowed');
