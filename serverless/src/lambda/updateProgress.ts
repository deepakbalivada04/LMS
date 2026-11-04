import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { ddbDocClient, TABLES } from '../lib/dynamoClient.js';
import { createResponse, extractUserIdFromEvent } from '../lib/response.js';

interface UpdateProgressPayload {
  userId?: string;
  courseId: string;
  moduleId: string;
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('[updateProgress] Incoming request:', JSON.stringify(event));

  // Handle CORS preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS' || (event as any).requestContext?.http?.method === 'OPTIONS') {
    return createResponse(200, { message: 'CORS Preflight OK' });
  }

  try {
    let payload: UpdateProgressPayload;
    try {
      payload = typeof event.body === 'string' ? JSON.parse(event.body) : (event.body || {});
    } catch {
      return createResponse(400, { error: 'Invalid JSON payload in request body' });
    }

    // Determine userId securely from Cognito JWT token claims; fallback to body.userId
    const authenticatedUserId = extractUserIdFromEvent(event);
    const userId = authenticatedUserId || payload.userId;

    if (!userId) {
      return createResponse(401, {
        error: 'Unauthorized: Missing valid Cognito authentication credentials or userId',
      });
    }

    const { courseId, moduleId } = payload;
    if (!courseId || !moduleId) {
      return createResponse(400, {
        error: 'Missing required parameters: courseId and moduleId are required.',
      });
    }

    // 1. Fetch Course details to determine total modules count
    let totalModules = 2; // Default fallback count if course item is not pre-populated in DDB
    try {
      const courseResult = await ddbDocClient.send(
        new GetCommand({
          TableName: TABLES.COURSES,
          Key: { courseId },
        })
      );

      if (courseResult.Item && Array.isArray(courseResult.Item.modules)) {
        totalModules = courseResult.Item.modules.length;
      }
    } catch (courseErr) {
      console.warn('[updateProgress] Could not retrieve course modules from Courses table, using fallback count:', courseErr);
    }

    // 2. Fetch existing Progress record for this student and course
    let completedModules: string[] = [];
    let examScore: number | undefined = undefined;

    try {
      const progressResult = await ddbDocClient.send(
        new GetCommand({
          TableName: TABLES.PROGRESS,
          Key: { userId, courseId },
        })
      );

      if (progressResult.Item) {
        completedModules = Array.isArray(progressResult.Item.completedModules)
          ? progressResult.Item.completedModules
          : [];
        examScore = progressResult.Item.examScore;
      }
    } catch (progressErr) {
      console.warn('[updateProgress] No existing progress record found, initializing new record');
    }

    // 3. Append module if not already completed
    if (!completedModules.includes(moduleId)) {
      completedModules.push(moduleId);
    }

    // 4. Recalculate completion percentage
    const completionPercentage = Math.min(
      100,
      Math.round((completedModules.length / Math.max(1, totalModules)) * 100)
    );

    const now = new Date().toISOString();

    const progressRecord = {
      userId,
      courseId,
      completionPercentage,
      completedModules,
      examScore,
      lastUpdated: now,
    };

    // 5. Save updated record in DynamoDB
    await ddbDocClient.send(
      new PutCommand({
        TableName: TABLES.PROGRESS,
        Item: progressRecord,
      })
    );

    console.log('[updateProgress] Progress updated successfully:', JSON.stringify(progressRecord));

    return createResponse(200, {
      message: 'Course progress updated successfully',
      progress: progressRecord,
    });
  } catch (error: any) {
    console.error('[updateProgress] Unhandled error:', error);
    return createResponse(500, {
      error: 'Internal Server Error while updating course progress',
      details: error?.message || String(error),
    });
  }
};

