import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { ddbDocClient, TABLES } from '../lib/dynamoClient.js';
import { createResponse, extractUserIdFromEvent } from '../lib/response.js';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // Handle CORS preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS' || (event as any).requestContext?.http?.method === 'OPTIONS') {
    return createResponse(200, { message: 'CORS Preflight OK' });
  }

  try {
    const authenticatedUserId = extractUserIdFromEvent(event);
    const queryUserId = event.queryStringParameters?.userId;
    const userId = authenticatedUserId || queryUserId;

    const courseId = event.queryStringParameters?.courseId;

    if (!userId || !courseId) {
      return createResponse(400, {
        error: 'Missing required parameters: userId and courseId are required.',
      });
    }

    const result = await ddbDocClient.send(
      new GetCommand({
        TableName: TABLES.PROGRESS,
        Key: { userId, courseId },
      })
    );

    if (!result.Item) {
      return createResponse(200, {
        progress: {
          userId,
          courseId,
          completionPercentage: 0,
          completedModules: [],
        },
      });
    }

    return createResponse(200, {
      progress: result.Item,
    });
  } catch (error: any) {
    console.error('[getProgress] Error:', error);
    return createResponse(500, {
      error: 'Failed to retrieve progress from DynamoDB',
      details: error?.message || String(error),
    });
  }
};

