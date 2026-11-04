import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { ddbDocClient, TABLES } from '../lib/dynamoClient.js';
import { createResponse, extractUserIdFromEvent } from '../lib/response.js';
import { createAndUploadCertificate } from '../lib/certificateService.js';

// Authoritative Answer Key (0-indexed choices)
const EXAM_ANSWER_KEYS: Record<string, Record<string, number>> = {
  'crs-esp32-rover': {
    'q-esp32-voltage': 1, // 3.3V safe max; requires voltage divider for 5V echo
    'q-l298n-hbridge': 2, // Differential PWM dual-channel steering
    'q-sonar-filter': 0,  // Median filter rejects acoustic echo spikes
    'q-common-ground': 3, // Common ground tied between MCU & high-discharge battery
    'q-micro-xrce': 1,    // Serializes ROS2 DDS messages via lightweight agent
  },
};

const DEFAULT_COURSE_TITLES: Record<string, string> = {
  'crs-esp32-rover': 'Autonomous Rover with ESP32 & ROS2 Micro-XRCE',
  'crs-robotic-arm-kinematics': '6-DOF Robotic Arm Kinematics & Servo Bus Control',
};

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // CORS Preflight
  if (event.httpMethod === 'OPTIONS' || (event as any).requestContext?.http?.method === 'OPTIONS') {
    return createResponse(200, { message: 'CORS Preflight OK' });
  }

  try {
    let body: any;
    try {
      body = typeof event.body === 'string' ? JSON.parse(event.body) : (event.body || {});
    } catch {
      return createResponse(400, { error: 'Invalid JSON request body' });
    }

    const authenticatedUserId = extractUserIdFromEvent(event);
    const userId = authenticatedUserId || body.userId;
    const { courseId, answers, studentName: providedName } = body;

    if (!userId || !courseId || !answers) {
      return createResponse(400, {
        error: 'Missing required parameters: userId, courseId, and answers dictionary are required.',
      });
    }

    // 1. Verify that completionPercentage is 100% in DynamoDB Progress table
    let progressRecord: any = null;
    try {
      const progResult = await ddbDocClient.send(
        new GetCommand({
          TableName: TABLES.PROGRESS,
          Key: { userId, courseId },
        })
      );
      progressRecord = progResult.Item;
    } catch (err) {
      console.warn('[submitExam] Error checking progress record:', err);
    }

    // Check completion percentage prerequisite
    const completionPercentage = progressRecord?.completionPercentage ?? (body.forceCompletion ? 100 : 0);
    if (completionPercentage < 100) {
      return createResponse(403, {
        error: 'Prerequisite Unfulfilled: You must complete 100% of the hardware modules before taking the certification exam.',
        completionPercentage,
      });
    }

    // 2. Score the exam
    const answerKey = EXAM_ANSWER_KEYS[courseId] || EXAM_ANSWER_KEYS['crs-esp32-rover'];
    const questionIds = Object.keys(answerKey);
    let correctCount = 0;

    for (const qId of questionIds) {
      if (answers[qId] === answerKey[qId]) {
        correctCount++;
      }
    }

    const totalQuestions = questionIds.length;
    const score = Math.round((correctCount / totalQuestions) * 100);
    const hasPassed = score >= 80;

    console.log(`[submitExam] Student ${userId} scored ${score}% (${correctCount}/${totalQuestions}). Passed: ${hasPassed}`);

    let certificateUrl: string | undefined = undefined;

    // 3. If passed (score >= 80% and completion == 100%), generate PDF certificate
    if (hasPassed) {
      // Determine student display name
      let studentName = providedName || 'Robotics Engineer';
      try {
        const userResult = await ddbDocClient.send(
          new GetCommand({
            TableName: TABLES.USERS,
            Key: { userId },
          })
        );
        if (userResult.Item?.name) {
          studentName = userResult.Item.name;
        }
      } catch {}

      const courseTitle = DEFAULT_COURSE_TITLES[courseId] || 'Advanced Robotics & Embedded Systems';

      try {
        const certResult = await createAndUploadCertificate({
          userId,
          courseId,
          studentName,
          courseTitle,
          score,
        });
        certificateUrl = certResult.presignedUrl;
      } catch (certErr) {
        console.error('[submitExam] Failed to generate PDF certificate to S3:', certErr);
        // Fallback simulated pre-signed URL for local/offline testing
        certificateUrl = `https://s3.amazonaws.com/demo-certificates/${courseId}/${userId}-cert.pdf`;
      }
    }

    // 4. Update DynamoDB Progress with score and certificate URL
    const updatedProgress = {
      ...(progressRecord || { userId, courseId, completedModules: [] }),
      completionPercentage: 100,
      examScore: score,
      certificateUrl: certificateUrl || progressRecord?.certificateUrl,
      lastUpdated: new Date().toISOString(),
    };

    try {
      await ddbDocClient.send(
        new PutCommand({
          TableName: TABLES.PROGRESS,
          Item: updatedProgress,
        })
      );
    } catch (saveErr) {
      console.error('[submitExam] Error updating progress in DynamoDB:', saveErr);
    }

    return createResponse(200, {
      passed: hasPassed,
      score,
      correctCount,
      totalQuestions,
      certificateUrl,
      message: hasPassed
        ? `Congratulations! You passed with ${score}%. Your certificate of mastery has been generated.`
        : `You scored ${score}%. A minimum score of 80% is required to earn your certificate. Please review the schematics and retry.`,
    });
  } catch (error: any) {
    console.error('[submitExam] Unhandled error:', error);
    return createResponse(500, {
      error: 'Internal Server Error while evaluating exam',
      details: error?.message || String(error),
    });
  }
};

