import { fetchAuthSession } from 'aws-amplify/auth';
import { awsConfig } from '../aws-exports';

export interface SubmitExamPayload {
  userId: string;
  courseId: string;
  studentName?: string;
  answers: Record<string, number>;
  forceCompletion?: boolean;
}

export interface ExamResultResponse {
  passed: boolean;
  score: number;
  correctCount: number;
  totalQuestions: number;
  certificateUrl?: string;
  message: string;
  error?: string;
}

export const examApi = {
  async submitExam(payload: SubmitExamPayload): Promise<ExamResultResponse> {
    const apiEndpoint = awsConfig.apiEndpoint;

    // If API Gateway is configured, call the live AWS Lambda backend
    if (apiEndpoint) {
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

        const response = await fetch(`${apiEndpoint}/exam/submit`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || `HTTP ${response.status}: Failed to submit exam`);
        }

        return data;
      } catch (err: any) {
        console.warn('[ExamAPI] Live API call failed, falling back to local grading engine:', err);
      }
    }

    // Local / Offline Simulation (matching serverless Lambda logic)
    const correctAnswers: Record<string, number> = {
      'q-esp32-voltage': 1,
      'q-l298n-hbridge': 2,
      'q-sonar-filter': 0,
      'q-common-ground': 3,
      'q-micro-xrce': 1,
    };

    let correctCount = 0;
    const totalQuestions = Object.keys(correctAnswers).length;

    for (const [qId, correctIndex] of Object.entries(correctAnswers)) {
      if (payload.answers[qId] === correctIndex) {
        correctCount++;
      }
    }

    const score = Math.round((correctCount / totalQuestions) * 100);
    const passed = score >= 80;

    return {
      passed,
      score,
      correctCount,
      totalQuestions,
      certificateUrl: passed
        ? `https://robolms-certificates-demo.s3.amazonaws.com/certificates/${payload.courseId}/${payload.userId}-certificate.pdf`
        : undefined,
      message: passed
        ? `Congratulations! You scored ${score}%. Your certificate has been issued.`
        : `You scored ${score}%. A minimum score of 80% is required to pass.`,
    };
  },
};

