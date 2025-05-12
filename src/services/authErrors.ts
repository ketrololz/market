export class AuthError extends Error {
  public statusCode?: number;
  public ctpErrorCode?: string;
  public details?: unknown;

  constructor(
    message: string,
    statusCode?: number,
    ctpErrorCode?: string,
    details?: unknown,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.ctpErrorCode = ctpErrorCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class InvalidCredentialsError extends AuthError {
  constructor(apiMessage?: string) {
    super(
      apiMessage || 'Invalid email or password.',
      400,
      'InvalidCredentials',
      { originalApiMessage: apiMessage },
    );
  }
}

export class EmailInUseError extends AuthError {
  constructor(apiMessage?: string) {
    super(
      apiMessage || 'This email address is already in use.',
      400,
      'DuplicateField',
      { originalApiMessage: apiMessage },
    );
  }
}

export class NetworkError extends AuthError {
  constructor(apiMessage?: string) {
    super(
      apiMessage || 'Network error. Please check your connection.',
      undefined,
      'NetworkError',
      { originalApiMessage: apiMessage },
    );
  }
}

export class UnknownAuthError extends AuthError {
  constructor(apiMessage?: string) {
    super(
      apiMessage || 'An unexpected authentication error occurred.',
      undefined,
      'UnknownAuthError',
      { originalApiMessage: apiMessage },
    );
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
    const detailedMessage =
      body.errors?.[0]?.message ||
      body.message ||
      sdkError.message ||
      'An error occurred with the CommerceTools API.';
    const oauthErrorDescription = body.error_description;

    if (body.error === 'invalid_grant') {
      return new InvalidCredentialsError(
        oauthErrorDescription ||
          'Invalid email or password provided to authentication server.',
      );
    }

    if (body.errors && body.errors.length > 0) {
      const firstError = body.errors[0];
      if (
        firstError.code === 'DuplicateField' &&
        firstError.field === 'email'
      ) {
        return new EmailInUseError(firstError.message);
      }
      if (
        firstError.code === 'InvalidOperation' &&
        firstError.message?.toLowerCase().includes('password does not match')
      ) {
        return new InvalidCredentialsError(firstError.message);
      }
      return new AuthError(
        detailedMessage,
        sdkError.statusCode,
        firstError.code,
        body.errors,
      );
    }

    return new AuthError(
      detailedMessage,
      sdkError.statusCode,
      body.error || 'CtpApiError',
      body,
    );
  }

  if (sdkError instanceof Error) {
    if (
      sdkError.message.toLowerCase().includes('failed to fetch') ||
      sdkError.message.toLowerCase().includes('networkerror')
    ) {
      return new NetworkError(sdkError.message);
    }
    return new UnknownAuthError(sdkError.message);
  }

  console.error('Unknown error structure passed to parseCtpError:', sdkError);
  return new UnknownAuthError(
    'An unexpected error occurred (unknown structure).',
  );
}
