/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AWS_REGION?: string;
  readonly VITE_COGNITO_USER_POOL_ID?: string;
  readonly VITE_COGNITO_CLIENT_ID?: string;
  readonly VITE_ADMIN_EMAIL?: string;
  readonly VITE_API_GATEWAY_URL?: string;
  readonly VITE_GET_UPLOAD_URL_API?: string;
  readonly VITE_UPDATE_PROGRESS_API?: string;
  readonly VITE_GENERATE_CERTIFICATE_API?: string;
  readonly VITE_SUBMIT_EXAM_API?: string;
  readonly VITE_S3_BUCKET?: string;
  readonly VITE_CLOUDFRONT_DOMAIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
