import * as yup from 'yup';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const emailSchema = yup
  .string()
  .trim()
  .matches(emailRegex, 'Invalid email format')
  .required('Email is required');

export const passwordSchema = yup
  .string()
  .min(8, 'Minimum 8 characters')
  .matches(/[A-Z]/, 'At least one uppercase letter')
  .matches(/[a-z]/, 'At least one lowercase letter')
  .matches(/\d/, 'At least one number')
  .matches(/[!@#$%^&*()-_=+|{};:`/?.<>]/, 'At least one special character')
  .required('Password is required')
  .test(
    'no-whitespace',
    'No leading or trailing spaces allowed',
    (val) => val?.trim() === val,
  );

export const nameSchema = yup
  .string()
  .trim()
  .min(2, 'Minimum 1 character')
  .matches(/^[A-Za-zА-Яа-яёЁ0-9]+$/, 'Only letters and numbers are allowed');

const minRequiredAge = 13;

export const dateSchema = yup
  .date()
  .max(
    new Date(new Date().setFullYear(new Date().getFullYear() - minRequiredAge)),
    `A User must be at least ${minRequiredAge} years old`,
  )
  .required('Date of birth is required');

export const addressSchema = yup.object({
  street: yup.string().min(1, 'Street  is required'),
  city: yup
    .string()
    .required('City is required')
    .matches(/^[A-Za-zА-Яа-яёЁ\s-]+$/, 'Only letters and spaces are allowed'),
  postalCode: yup
    .string()
    .required('Postal code is required')
    .matches(
      /^\d{5}$|^[A-Za-z]\d[A-Za-z] \d[A-Za-z]\d$/,
      'Postal code must match the country format',
    ),
  country: yup.string().required('Country is required'),
});
