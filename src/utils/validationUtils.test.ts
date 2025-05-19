import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateData } from '@/utils/validationUtils';
import * as yup from 'yup';
import { ClientValidationError, AuthError } from '@/services/appErrors';
import appLogger from '@/utils/logger';
import { AuthMessageKey } from '@/localization/i18nKeys';

vi.mock('@/utils/logger', () => ({
  default: {
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

interface TestData {
  name: string;
  age?: number;
}

describe('validationUtils', () => {
  const mockGoodData: TestData = { name: 'Test' };
  const mockBadData: TestData = { name: '' };

  const mockSchema: yup.ObjectSchema<TestData> = yup.object({
    name: yup.string().required('Name is required'),
    age: yup.number().optional().min(18, 'Must be 18 or older'),
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should resolve (return void) if data is valid', async () => {
    await expect(
      validateData(mockSchema, mockGoodData, 'TestContext'),
    ).resolves.toBeUndefined();
    expect(appLogger.log).toHaveBeenCalledWith(
      'ValidationUtils: TestContext passed service-level validation.',
    );
  });

  it('should throw ClientValidationError if data is invalid according to yup schema', async () => {
    expect.assertions(4);
    try {
      await validateData(mockSchema, mockBadData, 'TestContext');
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(ClientValidationError);
      if (error instanceof ClientValidationError) {
        expect(error.i18nKey).toBe(AuthMessageKey.ClientValidationFailed);
        expect(error.yupErrors).toEqual({ name: 'Name is required' });
        expect(appLogger.warn).toHaveBeenCalledWith(
          'ValidationUtils: TestContext failed service-level validation:',
          ['Name is required'],
        );
      }
    }
  });

  it('should throw AuthError for non-Yup errors during schema.validate call', async () => {
    const errorMessage = 'Something went wrong during schema.validate';
    const faultySchema = {
      validate: vi.fn().mockRejectedValueOnce(new Error(errorMessage)),
    } as unknown as yup.ObjectSchema<TestData>;

    expect.assertions(3);
    try {
      await validateData(faultySchema, mockGoodData, 'TestContext');
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(AuthError);
      if (error instanceof AuthError) {
        expect(error.i18nKey).toBe(AuthMessageKey.UnknownError);
        expect(error.message).toBe(
          `Unexpected error during TestContext validation.`,
        );
        if (
          typeof error.details === 'object' &&
          error.details !== null &&
          'message' in error.details
        ) {
          expect((error.details as { message: string }).message).toBe(
            errorMessage,
          );
        }
      }
    }
  });
});
