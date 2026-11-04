/**
 * AWS Configuration module for Amplify Auth and API Gateway
 * Values are loaded from Vite environment variables (prefixed with VITE_)
 */

export interface AWSConfig {
  region: string;
  userPoolId: string;
  userPoolClientId: string;
  apiEndpoint?: string;
  s3Bucket?: string;
  isConfigured: boolean;
}

export const awsConfig: AWSConfig = {
  region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
  userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID || '',
  userPoolClientId: import.meta.env.VITE_COGNITO_CLIENT_ID || '',
  apiEndpoint: import.meta.env.VITE_API_GATEWAY_URL || '',
  s3Bucket: import.meta.env.VITE_S3_BUCKET || '',
  isConfigured: Boolean(
    import.meta.env.VITE_COGNITO_USER_POOL_ID &&
    import.meta.env.VITE_COGNITO_CLIENT_ID
  ),
};

