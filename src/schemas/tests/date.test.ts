import { describe, it, expect } from 'vitest';
import { dateSchema } from './../dateSchema';
import { ValidationError } from 'yup';

const validate = (input: unknown) =>
  dateSchema.validate(input, { abortEarly: false });

const expectErrorContains = async (value: unknown, errorMessage: string) => {
  try {
    await validate(value);
    throw new Error('Validation should have failed but passed');
  } catch (e) {
    if (e instanceof ValidationError) {
      expect(e.errors.some((msg: string) => msg.includes(errorMessage))).toBe(
        true,
      );
    } else {
      throw new Error('Unexpected error type thrown');
    }
  }
};

describe('dateSchema', () => {
  it('fails if input is an empty string', async () => {
    await expectErrorContains(undefined, 'Date of birth is required');
  });

  it('fails if date is in invalid format', async () => {
    await expectErrorContains(
      '14/01/2000',
      'Invalid date format or non-existent',
    );
  });

  it('fails if date is not real (e.g. 2023-02-30)', async () => {
    await expectErrorContains(
      '2023-02-30',
      'Invalid date format or non-existent',
    );
  });

  it('fails if date is older than 100 years', async () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 101);
    const str = date.toISOString().split('T')[0];
    await expectErrorContains(str, 'Date of birth must be within the last');
  });

  it('fails if user is younger than 13', async () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 10);
    const str = date.toISOString().split('T')[0];
    await expectErrorContains(str, 'User must be at least');
  });

  it('passes if user is exactly 13', async () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 13);
    const str = date.toISOString().split('T')[0];
    await expect(validate(str)).resolves.toBeDefined();
  });

  it('passes if user is exactly 100', async () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 100);
    date.setDate(date.getDate() + 1);
    const str = date.toISOString().split('T')[0];
    await expect(validate(str)).resolves.toBeDefined();
  });
});
