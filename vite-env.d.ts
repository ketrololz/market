/// <reference types="vite/client" />
/// <reference types="vite/types/importMeta.d.ts" />
/// <reference types="vitest/globals" />

interface ImportMetaEnv {
  readonly VITE_CTP_PROJECT_KEY: string;
  readonly VITE_CTP_CLIENT_ID: string;
  readonly VITE_CTP_CLIENT_SECRET: string;
  readonly VITE_CTP_API_URL: string;
  readonly VITE_CTP_AUTH_URL: string;
  readonly VITE_CTP_SCOPES: string;
  readonly VITE_APP_LOGGING_ENABLED: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}
