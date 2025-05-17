import { describe, it, expect, vi } from 'vitest';
import {
  AuthError,
  InvalidCredentialsError,
  EmailInUseError,
  NetworkError,
  UnknownAuthError,
  ClientValidationError,
  parseCtpError,
} from './authErrors';
import { AuthMessageKey } from '@/localization/i18nKeys';
import * as yup from 'yup';

vi.spyOn(console, 'error').mockImplementation(() => {});

describe('AuthError Classes', () => {
  it('AuthError should correctly initialize properties', () => {
    const details = { info: 'some details' };
    const params = { param: 'value' };
    const error = new AuthError(AuthMessageKey.UnknownError, {
      statusCode: 500,
      ctpErrorCode: 'General',
      details,
      i18nParams: params,
      messageForSuper: 'Super Message',
    });

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AuthError);
    expect(error.name).toBe('AuthError');
    expect(error.message).toBe('Super Message');
    expect(error.i18nKey).toBe(AuthMessageKey.UnknownError);
    expect(error.statusCode).toBe(500);
    expect(error.ctpErrorCode).toBe('General');
    expect(error.details).toEqual(details);
    expect(error.i18nParams).toEqual(params);
  });

  it('InvalidCredentialsError should initialize with correct defaults', () => {
    const error = new InvalidCredentialsError({ someDetail: 'detail' });
    expect(error.name).toBe('InvalidCredentialsError');
    expect(error.i18nKey).toBe(AuthMessageKey.LoginInvalidCredentials);
    expect(error.statusCode).toBe(400);
    expect(error.ctpErrorCode).toBe('InvalidCredentials');
    expect(error.details).toEqual({ someDetail: 'detail' });
  });

  it('EmailInUseError should initialize with correct defaults', () => {
    const error = new EmailInUseError({ field: 'email' });
    expect(error.name).toBe('EmailInUseError');
    expect(error.i18nKey).toBe(AuthMessageKey.RegisterEmailInUse);
    expect(error.statusCode).toBe(400);
    expect(error.ctpErrorCode).toBe('DuplicateField');
    expect(error.details).toEqual({ field: 'email' });
  });

  it('NetworkError should initialize with correct defaults', () => {
    const error = new NetworkError({ info: 'offline' });
    expect(error.name).toBe('NetworkError');
    expect(error.i18nKey).toBe(AuthMessageKey.NetworkError);
    expect(error.statusCode).toBeUndefined();
    expect(error.ctpErrorCode).toBeUndefined();
    expect(error.details).toEqual({ info: 'offline' });
  });

  it('UnknownAuthError should initialize with correct defaults', () => {
    const error = new UnknownAuthError({ data: 'any' }, 'Original JS Message');
    expect(error.name).toBe('UnknownAuthError');
    expect(error.i18nKey).toBe(AuthMessageKey.UnknownError);
    expect(error.details).toEqual('Original JS Message');
    expect(error.i18nParams).toEqual({ details: 'Original JS Message' });
  });

  it('ClientValidationError should initialize with yupErrors and correct defaults', () => {
    const yupErrorMock = new yup.ValidationError('Validation failed');
    yupErrorMock.inner = [
      new yup.ValidationError('Email is required', null, 'email'),
      new yup.ValidationError('Password too short', null, 'password'),
    ];

    const error = new ClientValidationError(yupErrorMock);
    expect(error.name).toBe('ClientValidationError');
    expect(error.i18nKey).toBe(AuthMessageKey.ClientValidationFailed);
    expect(error.ctpErrorCode).toBe('ClientValidationError');
    expect(error.message).toBe('Client-side validation failed.');
    expect(error.yupErrors).toEqual({
      email: 'Email is required',
      password: 'Password too short',
    });
    expect(error.details).toEqual({
      email: 'Email is required',
      password: 'Password too short',
    });
  });

  it('ClientValidationError handles single yup error correctly', () => {
    const yupError = new yup.ValidationError(
      'Email is required',
      null,
      'email',
    );
    const error = new ClientValidationError(yupError);
    expect(error.yupErrors).toEqual({ email: 'Email is required' });
  });
});

describe('parseCtpError', () => {
  it('should parse InvalidCredentialsError', () => {
    const sdkError = {
      statusCode: 400,
      body: {
        message: 'Invalid credentials',
        errors: [
          { code: 'InvalidCredentials', message: 'Invalid email or password.' },
        ],
        error_description: 'Invalid email or password.',
      },
    };
    const parsedError = parseCtpError(sdkError);
    expect(parsedError).toBeInstanceOf(InvalidCredentialsError);
    expect(parsedError.i18nKey).toBe(AuthMessageKey.LoginInvalidCredentials);
    if (
      parsedError.details &&
      typeof parsedError.details === 'object' &&
      'originalApiMessage' in parsedError.details
    ) {
      expect(
        (parsedError.details as { originalApiMessage: string })
          .originalApiMessage,
      ).toBe('Invalid email or password.');
    }
  });

  it('should parse EmailInUseError', () => {
    const sdkError = {
      statusCode: 400,
      body: {
        message: 'Duplicate Field',
        errors: [
          {
            code: 'DuplicateField',
            field: 'email',
            message: 'Account with this email already exists.',
          },
        ],
      },
    };
    const parsedError = parseCtpError(sdkError);
    expect(parsedError).toBeInstanceOf(EmailInUseError);
    expect(parsedError.i18nKey).toBe(AuthMessageKey.RegisterEmailInUse);
    if (
      parsedError.details &&
      typeof parsedError.details === 'object' &&
      'originalApiMessage' in parsedError.details
    ) {
      expect(
        (parsedError.details as { originalApiMessage: string })
          .originalApiMessage,
      ).toBe('Account with this email already exists.');
    }
  });

  it('should parse generic CtpApiError', () => {
    const sdkError = {
      statusCode: 400,
      body: {
        message: 'Some other CTP error',
        errors: [{ code: 'SomeOtherCode', message: 'Details for other code.' }],
      },
    };
    const parsedError = parseCtpError(sdkError);
    expect(parsedError).toBeInstanceOf(AuthError);
    expect(parsedError.name).toBe('AuthError');
    expect(parsedError.i18nKey).toBe(AuthMessageKey.CtpApiGeneral);
    expect(parsedError.ctpErrorCode).toBe('SomeOtherCode');
    expect(parsedError.i18nParams).toEqual({
      details: 'Details for other code.',
    });
  });

  it('should parse NetworkError from "failed to fetch"', () => {
    const error = new Error('failed to fetch');
    const parsedError = parseCtpError(error);
    expect(parsedError).toBeInstanceOf(NetworkError);
    expect(parsedError.i18nKey).toBe(AuthMessageKey.NetworkError);
  });

  it('should parse NetworkError from "networkerror" string', () => {
    const error = new Error('A networkerror occurred');
    const parsedError = parseCtpError(error);
    expect(parsedError).toBeInstanceOf(NetworkError);
  });

  it('should parse UnknownAuthError from generic Error', () => {
    const errorMessage = 'Just a generic error';
    const error = new Error(errorMessage);
    const parsedError = parseCtpError(error);
    expect(parsedError).toBeInstanceOf(UnknownAuthError);
    expect(parsedError.i18nKey).toBe(AuthMessageKey.UnknownError);
    if (
      parsedError.details &&
      typeof parsedError.details === 'object' &&
      'originalMessage' in parsedError.details
    ) {
      expect(
        (parsedError.details as { originalMessage: string }).originalMessage,
      ).toBe(errorMessage);
    }
    expect(parsedError.i18nParams).toEqual({ details: errorMessage });
  });

  it('should parse UnknownAuthError from unknown structure', () => {
    const error = { someWeirdError: 'data' };
    const parsedError = parseCtpError(error);
    expect(parsedError).toBeInstanceOf(UnknownAuthError);
    expect(parsedError.i18nKey).toBe(AuthMessageKey.UnknownError);
  });
});
