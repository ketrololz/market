/// <reference types="vite/client" />
/// <reference types="vite/types/importMeta.d.ts" />

interface ImportMetaEnv {
  readonly VITE_CT_PROJECT_KEY: string;
  readonly VITE_CT_CLIENT_ID: string;
  readonly VITE_CT_CLIENT_SECRET: string;
  readonly VITE_CT_API_URL: string;
  readonly VITE_CT_AUTH_URL: string;
  readonly VITE_CT_SCOPES: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}
