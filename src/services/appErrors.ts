import {
  AuthMessageKey,
  ProjectSettingsMessageKey,
} from '@/localization/i18nKeys';
import type { ValidationError } from 'yup';

/**
 * Base AppError class
 */
export class AppError extends Error {
  /**
   * I18n key for the error message
   */
  public i18nKey: AuthMessageKey | ProjectSettingsMessageKey | string;
  /**
   * Additional parameters for the error message
   */
  public i18nParams?: Record<string, unknown>;
  /**
   * HTTP status code for the error
   */
  public statusCode?: number;
  /**
   * Error code for the error
   */
  public errorCode?: string;
  /**
   * Additional error details
   */
  public details?: unknown;

  /**
   * Creates a new AppError instance
   * @param {string} i18nKey I18n key for the error message
   * @param {Object} options Additional options
   * @param {number} options.statusCode HTTP status code for the error
   * @param {string} options.errorCode Error code for the error
   * @param {unknown} options.details Additional error details
   * @param {Object} options.i18nParams Additional parameters for the error message
   * @param {string} options.messageForSuper Original error message
   */
  constructor(
    i18nKey: AuthMessageKey | ProjectSettingsMessageKey | string,
    options?: {
      statusCode?: number;
      errorCode?: string;
      details?: unknown;
      i18nParams?: Record<string, unknown>;
      messageForSuper?: string;
    },
  ) {
    super(options?.messageForSuper || String(i18nKey));
    this.name = this.constructor.name;
    this.i18nKey = i18nKey;
    this.statusCode = options?.statusCode;
    this.errorCode = options?.errorCode;
    this.details = options?.details;
    this.i18nParams = options?.i18nParams;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Project settings fetch error
 */
export class ProjectSettingsFetchError extends AppError {
  /**
   * Creates a new ProjectSettingsFetchError instance
   * @param {unknown} details Additional error details
   */
  constructor(details?: unknown) {
    super(ProjectSettingsMessageKey.FetchFailed, { details });
  }
}

/**
 * Project data unavailable error
 */
export class ProjectDataUnavailableError extends AppError {
  /**
   * Creates a new ProjectDataUnavailableError instance
   * @param {unknown} details Additional error details
   */
  constructor(details?: unknown) {
    super(ProjectSettingsMessageKey.DataUnavailable, { details });
  }
}

/**
 * Auth error
 */
export class AuthError extends AppError {
  /**
   * Error code from CTP API
   */
  public ctpErrorCode?: string;

  /**
   * Creates a new AuthError instance
   * @param {string} i18nKey I18n key for the error message
   * @param {Object} options Additional options
   * @param {number} options.statusCode HTTP status code for the error
   * @param {string} options.ctpErrorCode Error code from CTP API
   * @param {unknown} options.details Additional error details
   * @param {Object} options.i18nParams Additional parameters for the error message
   * @param {string} options.messageForSuper Original error message
   */
  constructor(
    i18nKey: AuthMessageKey | string,
    options?: {
      statusCode?: number;
      ctpErrorCode?: string;
      details?: unknown;
      i18nParams?: Record<string, unknown>;
      messageForSuper?: string;
    },
  ) {
    super(i18nKey, { ...options, errorCode: options?.ctpErrorCode });
    this.name = this.constructor.name;
    this.ctpErrorCode = options?.ctpErrorCode;
  }
}

/**
 * Invalid credentials error
 */
export class InvalidCredentialsError extends AuthError {
  /**
   * Creates a new InvalidCredentialsError instance
   * @param {unknown} details Additional error details
   */
  constructor(details?: unknown) {
    super(AuthMessageKey.LoginInvalidCredentials, {
      statusCode: 400,
      ctpErrorCode: 'InvalidCredentials',
      details,
    });
    this.name = 'InvalidCredentialsError';
  }
}

/**
 * Email in use error
 */
export class EmailInUseError extends AuthError {
  /**
   * Creates a new EmailInUseError instance
   * @param {unknown} details Additional error details
   */
  constructor(details?: unknown) {
    super(AuthMessageKey.RegisterEmailInUse, {
      statusCode: 400,
      ctpErrorCode: 'DuplicateField',
      details,
    });
    this.name = 'EmailInUseError';
  }
}

/**
 * Network error
 */
export class NetworkError extends AppError {
  /**
   * Creates a new NetworkError instance
   * @param {unknown} details Additional error details
   */
  constructor(details?: unknown) {
    super(AuthMessageKey.NetworkError, { details, errorCode: 'NetworkError' });
    this.name = 'NetworkError';
  }
}

/**
 * Unknown app error
 */
export class UnknownAppError extends AppError {
  /**
   * Creates a new UnknownAppError instance
   * @param {unknown} details Additional error details
   * @param {string} originalMessage Original error message
   */
  constructor(details?: unknown, originalMessage?: string) {
    super(AuthMessageKey.UnknownError, {
      details: originalMessage || details,
      i18nParams: originalMessage ? { details: originalMessage } : undefined,
      errorCode: 'UnknownAppError',
    });
    this.name = 'UnknownAppError';
  }
}

/**
 * Client validation error
 */
export class ClientValidationError extends AuthError {
  /**
   * Yup validation errors
   */
  public yupErrors: Record<string, string>;

  /**
   * Creates a new ClientValidationError instance
   * @param {ValidationError} yupError Yup validation error
   */
  constructor(yupError: ValidationError) {
    const errors: Record<string, string> = {};
    if (yupError.inner && yupError.inner.length > 0) {
      yupError.inner.forEach((err) => {
        if (err.path && !errors[err.path]) {
          errors[err.path] = err.message;
        }
      });
    } else if (yupError.path && yupError.message) {
      errors[yupError.path] = yupError.message;
    }

    super(AuthMessageKey.ClientValidationFailed, {
      ctpErrorCode: 'ClientValidationError',
      details: errors,
      messageForSuper: 'Client-side validation failed.',
    });
    this.yupErrors = errors;
    this.name = 'ClientValidationError';
  }
}

/**
 * CTP SDK error body
 */
interface CtpSdkErrorBody {
  statusCode?: number;
  message: string;
  errors?: CtpSdkErrorBodyError[];
  error?: string;
  error_description?: string;
}

/**
 * CTP SDK error body error
 */
interface CtpSdkErrorBodyError {
  code: string;
  message: string;
  field?: string;
}

/**
 * CTP SDK error
 */
interface CtpSdkError {
  statusCode?: number;
  message?: string;
  body?: CtpSdkErrorBody;
}

/**
 * Checks if the error is a CTP SDK error
 * @param {unknown} error Error to check
 * @returns {boolean} True if the error is a CTP SDK error
 */
function isCtpSdkError(error: unknown): error is CtpSdkError {
  if (typeof error !== 'object' || error === null) {
    return false;
  }
  const err = error as CtpSdkError;
  return (
    typeof err.statusCode === 'number' &&
    typeof err.body === 'object' &&
    err.body !== null
  );
}

/**
 * Parses the error to an AppError instance
 * @param {unknown} sdkError Error to parse
 * @returns {AppError} Parsed AppError instance
 */
export function parseError(sdkError: unknown): AppError {
  if (isCtpSdkError(sdkError)) {
    const body = sdkError.body!;
    const apiMessage =
      body.errors?.[0]?.message ||
      body.message ||
      sdkError.message ||
      'API error';
    const oauthErrorDescription = body.error_description;
    const ctpErrorCode = body.errors?.[0]?.code || body.error;

    if (ctpErrorCode === 'InvalidCredentials') {
      return new InvalidCredentialsError({
        originalApiMessage: oauthErrorDescription || apiMessage,
      });
    }
    if (
      ctpErrorCode === 'DuplicateField' &&
      body.errors?.[0]?.field === 'email'
    ) {
      return new EmailInUseError({ originalApiMessage: apiMessage });
    }
    return new AuthError(AuthMessageKey.CtpApiGeneral, {
      statusCode: sdkError.statusCode,
      ctpErrorCode: body.errors?.[0]?.code || body.error || 'CtpApiError',
      details: body.errors || body,
      i18nParams: { details: apiMessage },
    });
  }

  if (sdkError instanceof Error) {
    if (
      sdkError.message.toLowerCase().includes('failed to fetch') ||
      sdkError.message.toLowerCase().includes('networkerror')
    ) {
      return new NetworkError({ originalMessage: sdkError.message });
    }
    return new UnknownAppError(undefined, sdkError.message);
  }
  return new UnknownAppError();
}
