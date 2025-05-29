export enum AuthMessageKey {
  // --- Error Keys ---
  // General Authentication Errors
  UnknownError = 'errors.auth.unknown',
  NetworkError = 'errors.auth.network',
  // CommerceTools API Errors (general)
  CtpApiGeneral = 'errors.auth.ctpApiGeneral',

  // Login Errors
  LoginInvalidCredentials = 'errors.auth.login.invalidCredentials',
  LoginFailed = 'errors.auth.login.failedGeneral',

  // Registration Errors
  RegisterEmailInUse = 'errors.auth.register.emailInUse',
  RegisterFailed = 'errors.auth.register.failedGeneral',

  // Validation Errors
  ClientValidationFailed = 'errors.auth.clientValidationFailed',

  // Session and Logout Errors
  SessionRestoreFailed = 'errors.auth.sessionRestoreFailed',
  LogoutFailed = 'errors.auth.logoutFailed',

  // --- Success Message Keys ---
  LoginSuccess = 'success.auth.login',
  RegisterSuccess = 'success.auth.register',
  LogoutSuccess = 'success.auth.logout',
  SessionRestored = 'success.auth.sessionRestored',
  ProfileUpdateSuccess = 'success.auth.profileUpdate',
  PasswordUpdateSuccess = 'success.auth.passwordUpdate',
  DefaultAddressUpdateSuccess = 'success.auth.defaultAddressUpdate',
  AddressRemoveSuccess = 'success.auth.addressRemove',

  AddressRemoveFailed = 'errors.auth.addressRemoveFailed',
  PasswordUpdateFailed = 'errors.auth.passwordUpdateFailed',
  ProfileUpdateFailed = 'errors.auth.profileUpdateFailed',
  DefaultAddressUpdateFailed = 'errors.auth.defaultAddressUpdateFailed',
}

export enum ProjectSettingsMessageKey {
  // --- Error Keys ---
  FetchFailed = 'errors.projectSettings.fetchFailed',
  DataUnavailable = 'errors.projectSettings.dataUnavailable',

  // --- Success Message Keys ---
  SettingsLoaded = 'success.projectSettings.loaded',
}
