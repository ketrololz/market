import { AuthMessageKey } from '@/localization/i18nKeys';

export class AuthError extends Error {
  public i18nKey: AuthMessageKey | string;
  public i18nParams?: Record<string, unknown>;
  public statusCode?: number;
  public ctpErrorCode?: string;
  public details?: unknown;

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
    super(options?.messageForSuper || String(i18nKey));
    this.name = this.constructor.name;
    this.i18nKey = i18nKey;
    this.statusCode = options?.statusCode;
    this.ctpErrorCode = options?.ctpErrorCode;
    this.details = options?.details;
    this.i18nParams = options?.i18nParams;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class InvalidCredentialsError extends AuthError {
  constructor(details?: unknown) {
    super(AuthMessageKey.LoginInvalidCredentials, {
      statusCode: 400,
      ctpErrorCode: 'InvalidCredentials',
      details,
    });
  }
}

export class EmailInUseError extends AuthError {
  constructor(details?: unknown) {
    super(AuthMessageKey.RegisterEmailInUse, {
      statusCode: 400,
      ctpErrorCode: 'DuplicateField',
      details,
    });
  }
}

export class NetworkError extends AuthError {
  constructor(details?: unknown) {
    super(AuthMessageKey.NetworkError, { details });
  }
}

export class UnknownAuthError extends AuthError {
  constructor(details?: unknown, originalMessage?: string) {
    super(AuthMessageKey.UnknownError, {
      details: originalMessage || details,
      i18nParams: originalMessage ? { details: originalMessage } : undefined,
    });
  }
}

interface CtpSdkErrorBodyError {
  code: string;
  message: string;
  field?: string;
}

interface CtpSdkErrorBody {
  statusCode?: number;
  message: string;
  errors?: CtpSdkErrorBodyError[];
  error?: string;
  error_description?: string;
}

interface CtpSdkError {
  statusCode?: number;
  message?: string;
  body?: CtpSdkErrorBody;
}

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

export function parseCtpError(sdkError: unknown): AuthError {
  if (isCtpSdkError(sdkError)) {
    const body = sdkError.body!;
    const apiMessage =
      body.errors?.[0]?.message ||
      body.message ||
      sdkError.message ||
      'API error';
    const oauthErrorDescription = body.error_description;

    if (body.errors?.[0]?.code === 'InvalidCredentials') {
      return new InvalidCredentialsError({
        originalApiMessage: oauthErrorDescription || apiMessage,
      });
    }
    if (
      body.errors?.[0]?.code === 'DuplicateField' &&
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
    return new UnknownAuthError(undefined, sdkError.message);
  }
  return new UnknownAuthError();
}
