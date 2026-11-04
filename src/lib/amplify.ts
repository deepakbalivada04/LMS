import { Amplify } from 'aws-amplify';
import { awsConfig } from '../aws-exports';

// Configure Amplify if Cognito credentials are provided
if (awsConfig.isConfigured) {
  try {
    Amplify.configure({
      Auth: {
        Cognito: {
          userPoolId: awsConfig.userPoolId,
          userPoolClientId: awsConfig.userPoolClientId,
        },
      },
    });
    console.log('[RoboLMS] AWS Amplify configured with User Pool:', awsConfig.userPoolId);
  } catch (error) {
    console.error('[RoboLMS] Failed to initialize Amplify:', error);
  }
} else {
  console.info('[RoboLMS] No Cognito credentials found in .env. Running in Mock/Preview mode.');
}

export { Amplify };

