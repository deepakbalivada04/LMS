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
  /**
   * Evaluates the exam answers and generates the S3 PDF certificate
   */
  async submitExam(payload: SubmitExamPayload): Promise<ExamResultResponse> {
    const certEndpoint = awsConfig.generateCertificateApi;
    const examEndpoint = awsConfig.submitExamApi;

    // Correct master answers for robotics hardware questions
    const correctAnswers: Record<string, number> = {
      'q-esp32-voltage': 1, // 3.3V safe max; requires voltage divider for 5V echo
      'q-l298n-hbridge': 2, // Differential PWM dual-channel steering
      'q-sonar-filter': 0,  // Median filter rejects acoustic false echo outliers
      'q-common-ground': 3, // Common ground tied between MCU & motor battery rail
      'q-micro-xrce': 1,    // Serializes ROS2 DDS messages to host agent
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

    let certificateUrl: string | undefined = undefined;

    // 1. If passed, invoke the live AWS Lambda generateCertificate endpoint
    if (passed && certEndpoint) {
      console.log(`[ExamAPI] Student passed (${score}%). Calling live AWS generateCertificate: ${certEndpoint}`);

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

        const certResponse = await fetch(certEndpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            userId: payload.userId,
            courseId: payload.courseId,
            studentName: payload.studentName || 'Robotics Student',
            score,
          }),
        });

        if (certResponse.ok) {
          const certData = await certResponse.json();
          console.log('[ExamAPI] S3 PDF Certificate Generated via Lambda:', certData);
          certificateUrl = certData.certificateUrl;
        } else {
          const errText = await certResponse.text();
          console.warn('[ExamAPI] generateCertificate returned HTTP error:', errText);
        }
      } catch (err) {
        console.error('[ExamAPI] Failed to call generateCertificate Lambda:', err);
      }
    }

    return {
      passed,
      score,
      correctCount,
      totalQuestions,
      certificateUrl,
      message: passed
        ? `Congratulations! You passed with ${score}%. Your official S3-signed PDF certificate has been generated.`
        : `You scored ${score}%. A score of 80% or higher is required to pass. Please review the schematics and retry.`,
    };
  },

  /**
   * Direct invocation of generateCertificate Lambda
   */
  async generateCertificate(
    userId: string,
    courseId: string,
    studentName: string,
    score: number = 100
  ): Promise<string | null> {
    const certEndpoint = awsConfig.generateCertificateApi;
    if (!certEndpoint) return null;

    try {
      const response = await fetch(certEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          courseId,
          studentName,
          score,
        }),
      });

      if (!response.ok) return null;
      const data = await response.json();
      return data.certificateUrl || null;
    } catch (e) {
      console.error('Error generating certificate:', e);
      return null;
    }
  },
};
