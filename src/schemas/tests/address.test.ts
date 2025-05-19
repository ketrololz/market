import { describe, it, expect } from 'vitest';
import { addressSchema } from './../addressSchema';
import { ValidationError, reach, StringSchema } from 'yup';

describe('addressSchema', () => {
  const baseData = {
    streetName: 'Main St',
    city: 'Moscow',
    postalCode: '123456',
    country: 'RU',
  };

  it('validates correct Russian address', async () => {
    const data = { ...baseData, postalCode: '123456' };
    await expect(addressSchema.validate(data)).resolves.toBeDefined();
  });

  it('fails on invalid Russian postal code', async () => {
    const data = { ...baseData, postalCode: '12' };
    await expect(
      addressSchema.validate(data, { abortEarly: false }),
    ).rejects.toThrow('Postal code must be 6 digits (Russia)');
  });

  it('validates correct German postal code', async () => {
    const data = {
      ...baseData,
      country: 'DE',
      postalCode: '12345',
    };
    await expect(addressSchema.validate(data)).resolves.toBeDefined();
  });

  it('fails on invalid German postal code', async () => {
    const data = {
      ...baseData,
      country: 'DE',
      postalCode: '12As',
    };
    await expect(
      addressSchema.validate(data, { abortEarly: false }),
    ).rejects.toThrow('Postal code must be 5 digits (Germany)');
  });

  it('validates correct US ZIP code', async () => {
    const data = {
      ...baseData,
      country: 'US',
      postalCode: '12345-6789',
    };
    await expect(addressSchema.validate(data)).resolves.toBeDefined();
  });

  it('fails on invalid US ZIP code', async () => {
    const data = {
      ...baseData,
      country: 'US',
      postalCode: '12',
    };
    await expect(
      addressSchema.validate(data, { abortEarly: false }),
    ).rejects.toThrow('ZIP code must be 12345 or 12345-6789 (US)');
  });

  it('fails if country is missing', async () => {
    const data = { ...baseData, country: null };
    try {
      await addressSchema.validate(data, { abortEarly: false });
    } catch (err: unknown) {
      const messages = (err as { errors?: string[] })?.errors || [];
      expect(messages).toContain('Country is required');
    }
  });

  it('fails on invalid city format', async () => {
    const data = { ...baseData, city: 'Moscow!', postalCode: '123456' };
    await expect(
      addressSchema.validate(data, { abortEarly: false }),
    ).rejects.toThrow('Only letters and spaces are allowed');
  });
});

it('fails on invalid postal code without country', async () => {
  const postalCodeSchema = reach(addressSchema, 'postalCode') as StringSchema;

  try {
    await postalCodeSchema.validate('12', {
      context: { country: null },
      abortEarly: false,
    });
  } catch (err) {
    if (err instanceof ValidationError) {
      expect(err.errors).toContain('Invalid postal code.');
    } else {
      throw err;
    }
  }
});
