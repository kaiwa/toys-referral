/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LIFF_ID: string
  readonly VITE_APP_URL: string
  readonly VITE_JOB_TITLE: string
  readonly VITE_JOB_DESCRIPTION: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
