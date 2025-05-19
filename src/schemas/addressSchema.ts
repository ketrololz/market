import * as yup from 'yup';

export const addressSchema = yup.object({
  streetName: yup
    .string()
    .min(1, 'Street  is required')
    .required('Street is required'),

  city: yup
    .string()
    .required('City is required')
    .matches(/^[A-Za-zА-Яа-яёЁ\s-]+$/, 'Only letters and spaces are allowed'),

  postalCode: yup
    .string()
    .nullable()
    .when('country', {
      is: (country: string) => !!country,
      then: (schema) =>
        schema
          .required('Postal code is required')
          .test('postalCodeValidation', function (value) {
            const { country } = this.parent;

            switch (country) {
              case 'RU':
                return /^\d{6}$/.test(value || '')
                  ? true
                  : this.createError({
                      message: 'Postal code must be 6 digits (Russia)',
                    });
              case 'US':
                return /^\d{5}(-\d{4})?$/.test(value || '')
                  ? true
                  : this.createError({
                      message: 'ZIP code must be 12345 or 12345-6789 (US)',
                    });
              case 'DE':
                return /^\d{5}$/.test(value || '')
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
  country: yup.string().required('Country is required'),
});
