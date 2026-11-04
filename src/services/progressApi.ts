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
   * Post module completion update to AWS Lambda updateCourseProgress endpoint
   */
  async updateProgress(
    userId: string,
    courseId: string,
    moduleId: string
  ): Promise<UserProgress | null> {
    const apiEndpoint = awsConfig.updateProgressApi;

    if (!apiEndpoint) {
      console.info('[ProgressAPI] No VITE_UPDATE_PROGRESS_API configured. Using local state mode.');
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

      console.log(`[ProgressAPI] Calling live AWS Lambda: POST ${apiEndpoint} (Course: ${courseId}, Module: ${moduleId})`);

      let response: Response;
      try {
        response = await fetch(apiEndpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            userId,
            courseId,
            moduleId,
          }),
        });
      } catch (directErr) {
        if (import.meta.env.DEV) {
          console.warn('[ProgressAPI] Direct fetch blocked by CORS, retrying via dev proxy /api-progress...');
          response = await fetch('/api-progress/updateCourseProgress', {
            method: 'POST',
            headers,
            body: JSON.stringify({
              userId,
              courseId,
              moduleId,
            }),
          });
        } else {
          throw directErr;
        }
      }

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Lambda updateCourseProgress returned HTTP ${response.status}: ${errText}`);
      }

      const data: ProgressApiResponse = await response.json();
      console.log('[ProgressAPI] Successfully updated DynamoDB LMS_Progress:', data);
      return data.progress;
    } catch (error) {
      console.error('[ProgressAPI] Error calling updateCourseProgress Lambda:', error);
      throw error;
    }
  },

  /**
   * Fetch current progress
   */
  async fetchProgress(userId: string, courseId: string): Promise<UserProgress | null> {
    const apiEndpoint = awsConfig.updateProgressApi;
    if (!apiEndpoint) return null;

    try {
      let token: string | undefined;
      try {
        const session = await fetchAuthSession();
        token = session.tokens?.idToken?.toString();
      } catch {}

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Query progress via POST or query params
      let response: Response;
      try {
        response = await fetch(apiEndpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            userId,
            courseId,
            fetchOnly: true,
          }),
        });
      } catch (directErr) {
        if (import.meta.env.DEV) {
          response = await fetch('/api-progress/updateCourseProgress', {
            method: 'POST',
            headers,
            body: JSON.stringify({
              userId,
              courseId,
              fetchOnly: true,
            }),
          });
        } else {
          throw directErr;
        }
      }

      if (!response.ok) return null;

      const data: ProgressApiResponse = await response.json();
      return data.progress;
    } catch (err) {
      console.warn('[ProgressAPI] Note: initial fetch from remote:', err);
      return null;
    }
  },
};
