import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const region = process.env.AWS_REGION || 'us-east-1';

const client = new DynamoDBClient({ region });

export const ddbDocClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
    convertEmptyValues: true,
  },
});

export const TABLES = {
  PROGRESS: process.env.PROGRESS_TABLE_NAME || 'RoboLMS-Progress',
  COURSES: process.env.COURSES_TABLE_NAME || 'RoboLMS-Courses',
  USERS: process.env.USERS_TABLE_NAME || 'RoboLMS-Users',
};

