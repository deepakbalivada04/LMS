import { fetchAuthSession } from 'aws-amplify/auth';
import { awsConfig } from '../aws-exports';
import { UserProgress } from '../types/course';

export interface ProgressApiResponse {
  message?: string;
  progress: UserProgress;
  error?: string;
}

export const progressApi = {
  /**
   * Post module completion update to AWS API Gateway
   */
  async updateProgress(
    userId: string,
    courseId: string,
    moduleId: string
  ): Promise<UserProgress | null> {
    const apiEndpoint = awsConfig.apiEndpoint;

    if (!apiEndpoint) {
      console.info('[ProgressAPI] No VITE_API_GATEWAY_URL configured in .env. Running in local state mode.');
      return null;
    }

    try {
      // 1. Retrieve Cognito JWT token if live session exists
      let token: string | undefined;
      try {
        const session = await fetchAuthSession();
        token = session.tokens?.idToken?.toString();
      } catch (authErr) {
        console.warn('[ProgressAPI] Could not retrieve Cognito auth session:', authErr);
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      console.log(`[ProgressAPI] POST ${apiEndpoint}/progress for course ${courseId}, module ${moduleId}`);

      const response = await fetch(`${apiEndpoint}/progress`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          userId,
          courseId,
          moduleId,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`API Gateway returned HTTP ${response.status}: ${errText}`);
      }

      const data: ProgressApiResponse = await response.json();
      console.log('[ProgressAPI] Successfully updated progress via API Gateway:', data);
      return data.progress;
    } catch (error) {
      console.error('[ProgressAPI] Error calling AWS API Gateway:', error);
      throw error;
    }
  },

  /**
   * Fetch current progress from AWS API Gateway
   */
  async fetchProgress(userId: string, courseId: string): Promise<UserProgress | null> {
    const apiEndpoint = awsConfig.apiEndpoint;
    if (!apiEndpoint) return null;

    try {
      let token: string | undefined;
      try {
        const session = await fetchAuthSession();
        token = session.tokens?.idToken?.toString();
      } catch {}

      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const url = `${apiEndpoint}/progress?userId=${encodeURIComponent(userId)}&courseId=${encodeURIComponent(courseId)}`;
      const response = await fetch(url, { method: 'GET', headers });

      if (!response.ok) {
        throw new Error(`Failed to fetch progress: HTTP ${response.status}`);
      }

      const data: ProgressApiResponse = await response.json();
      return data.progress;
    } catch (err) {
      console.warn('[ProgressAPI] Failed to fetch remote progress:', err);
      return null;
    }
  },
};

