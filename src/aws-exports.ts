/**
 * AWS Configuration module for Amplify Auth and API Gateway
 * Values are loaded from Vite environment variables (prefixed with VITE_)
 */

export interface AWSConfig {
  region: string;
  userPoolId: string;
  userPoolClientId: string;
  getUploadUrlApi: string;
  updateProgressApi: string;
  generateCertificateApi: string;
  submitExamApi: string;
  adminEmail: string;
  videoS3Bucket: string;
  isConfigured: boolean;
}

export const awsConfig: AWSConfig = {
  region: import.meta.env.VITE_AWS_REGION || 'ap-southeast-2',
  userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID || '',
  userPoolClientId: import.meta.env.VITE_COGNITO_CLIENT_ID || '',
  getUploadUrlApi: import.meta.env.VITE_GET_UPLOAD_URL_API || '',
  updateProgressApi: import.meta.env.VITE_UPDATE_PROGRESS_API || '',
  generateCertificateApi: import.meta.env.VITE_GENERATE_CERTIFICATE_API || '',
  submitExamApi: import.meta.env.VITE_SUBMIT_EXAM_API || '',
  adminEmail: import.meta.env.VITE_ADMIN_EMAIL || 'sannathkoushik@gmail.com',
  videoS3Bucket: import.meta.env.VITE_S3_VIDEO_BUCKET || 'robotics-lms-videos-2026',
  isConfigured: Boolean(
    import.meta.env.VITE_COGNITO_USER_POOL_ID &&
    import.meta.env.VITE_COGNITO_CLIENT_ID
  ),
};
