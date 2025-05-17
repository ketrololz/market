import appLogger from '@/utils/logger';
import * as yup from 'yup';
import { ClientValidationError, AuthError } from '@/services/authErrors';
import { AuthMessageKey } from '@/localization/i18nKeys';

/**
 * Asynchronously validates data using the provided Yup schema.
 * Throws ClientValidationError if validation fails.
 * Throws AuthError with UnknownError key for other errors.
 * @param schema - Yup schema for validation.
 * @param data - Data to validate.
 * @param context - A string for logging (e.g. 'Login Data' or 'Registration Data').
 */
export async function validateData<T extends object>(
  schema: yup.ObjectSchema<T>,
  data: T,
  context: string = 'Data',
): Promise<void> {
  try {
    await schema.validate(data, { abortEarly: false });
    appLogger.log(
      `ValidationUtils: ${context} passed service-level validation.`,
    );
  } catch (validationError: unknown) {
    if (validationError instanceof yup.ValidationError) {
      appLogger.warn(
        `ValidationUtils: ${context} failed service-level validation:`,
        validationError.errors,
      );
      throw new ClientValidationError(validationError);
    }
    appLogger.error(
      `ValidationUtils: Unexpected error during ${context} validation:`,
      validationError,
    );
    throw new AuthError(AuthMessageKey.UnknownError, {
      details:
        validationError instanceof Error
          ? validationError.message
          : String(validationError),
      messageForSuper: `Unexpected error during ${context} validation.`,
    });
  }
}
