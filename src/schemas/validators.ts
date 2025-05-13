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

export const nameSchema = yup
  .string()
  .trim()
  .min(1, 'Minimum 1 character')
  .matches(/^[A-Za-zА-Яа-яёЁ0-9]+$/, 'Only letters and numbers are allowed');

const minRequiredAge = 13;

export const dateSchema = yup
  .date()
  .typeError('Invalid date')
  .min(
    new Date(new Date().setFullYear(new Date().getFullYear() - 100)),
    'Date of birth must be within the last 100 years',
  )
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
    .nullable()
    .when('country', {
      is: (country) => country && country.code,
      then: (schema) =>
        schema
          .required('Postal code is required')
          .test('postalCodeValidation', function (value) {
            const { country } = this.parent;
            const code = country?.code;

            switch (code) {
              case 'RU':
                return /^\d{6}$/.test(value)
                  ? true
                  : this.createError({
                      message: 'Postal code must be 6 digits (Russia)',
                    });
              case 'US':
                return /^\d{5}(-\d{4})?$/.test(value)
                  ? true
                  : this.createError({
                      message: 'ZIP code must be 12345 or 12345-6789 (US)',
                    });
              case 'DE':
                return /^\d{5}$/.test(value)
                  ? true
                  : this.createError({
                      message: 'Postal code must be 5 digits (Germany)',
                    });
              default:
                return true;
            }
          }),
      otherwise: (schema) =>
        schema
          .required('Postal code is required')
          .test('defaultPostalCodeValidation', function (value) {
            if (!value) {
              return this.createError({
                message: 'Postal code is required',
              });
            }

            const isValidRussia = /^\d{6}$/.test(value);
            const isValidUS = /^\d{5}(-\d{4})?$/.test(value);
            const isValidGermany = /^\d{5}$/.test(value);

            if (isValidRussia || isValidUS || isValidGermany) {
              return true;
            }

            return this.createError({
              message: 'Invalid postal code.',
            });
          }),
    }),
  country: yup
    .object({
      name: yup.string().required(),
      code: yup.string().oneOf(['DE', 'RU', 'US']).required(),
    })
    .required('Country is required'),
});
