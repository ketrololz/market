import * as yup from 'yup';

const minRequiredAge = 13;

export const dateSchema = yup
  .mixed()
  .required('Date of birth is required')
  .transform((value) => {
    if (value instanceof Date) return value;

    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [year, month, day] = value.split('-').map(Number);
      const parsed = new Date(year, month - 1, day);

      if (
        parsed.getFullYear() === year &&
        parsed.getMonth() === month - 1 &&
        parsed.getDate() === day
      ) {
        return parsed;
      }
    }

    return new Date('Invalid Date');
  })
  .test(
    'is-valid-date',
    'Invalid date format or non-existent date (YYYY-MM-DD)',
    (value) => value instanceof Date && !isNaN(value.getTime()),
  )
  .test(
    'min-age',
    'Date of birth must be within the last 100 years',
    (value) => {
      if (!(value instanceof Date)) return false;
      const hundredYearsAgo = new Date();
      hundredYearsAgo.setFullYear(hundredYearsAgo.getFullYear() - 100);
      return value >= hundredYearsAgo;
    },
  )
  .test(
    'max-age',
    `User must be at least ${minRequiredAge} years old`,
    (value) => {
      if (!(value instanceof Date)) return false;
      const minAgeDate = new Date();
      minAgeDate.setFullYear(minAgeDate.getFullYear() - minRequiredAge);
      return value <= minAgeDate;
    },
  );
