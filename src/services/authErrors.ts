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
  constructor(message = 'Неверный email или пароль.') {
    super(message, 400, 'InvalidCredentials');
  }
}

export class EmailInUseError extends AuthError {
  constructor(message = 'Этот email уже используется.') {
    super(message, 400, 'DuplicateField');
  }
}

export class NetworkError extends AuthError {
  constructor(message = 'Ошибка сети. Пожалуйста, проверьте ваше соединение.') {
    super(message, undefined, 'NetworkError');
  }
}

export class UnknownAuthError extends AuthError {
  constructor(message = 'Произошла неизвестная ошибка аутентификации.') {
    super(message, undefined, 'UnknownAuthError');
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
    const message =
      body.message || sdkError.message || 'Ошибка от CommerceTools API.';
    const ctpErrorCode = body.errors?.[0]?.code || body.error || 'CtpApiError';

    if (
      body.error === 'invalid_grant' ||
      (body.errors?.[0]?.code === 'InvalidOperation' &&
        body.message?.toLowerCase().includes('password does not match'))
    ) {
      return new InvalidCredentialsError(
        body.error_description || 'Неверный email или пароль.',
      );
    }
    if (
      body.errors?.[0]?.code === 'DuplicateField' &&
      body.errors?.[0]?.field === 'email'
    ) {
      return new EmailInUseError();
    }
    return new AuthError(
      message,
      sdkError.statusCode,
      ctpErrorCode,
      body.errors,
    );
  }

  if (sdkError instanceof Error) {
    if (
      sdkError.message.toLowerCase().includes('failed to fetch') ||
      sdkError.message.toLowerCase().includes('networkerror')
    ) {
      return new NetworkError();
    }
    return new UnknownAuthError(sdkError.message);
  }

  console.error('Unknown error structure passed to parseCtpError:', sdkError);
  return new UnknownAuthError('Произошла непредвиденная ошибка.');
}
