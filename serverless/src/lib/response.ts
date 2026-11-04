export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Content-Type': 'application/json',
};

export const createResponse = (statusCode: number, body: Record<string, any>) => ({
  statusCode,
  headers: CORS_HEADERS,
  body: JSON.stringify(body),
});

export const extractUserIdFromEvent = (event: any): string | null => {
  // 1. From Cognito Authorizer claims (HTTP API payload format 2.0 or REST API)
  const claims = 
    event?.requestContext?.authorizer?.jwt?.claims ||
    event?.requestContext?.authorizer?.claims;
  
  if (claims?.sub) {
    return claims.sub;
  }
  if (claims?.['cognito:username']) {
    return claims['cognito:username'];
  }

  // 2. Fallback: check query parameters or body for local testing/mocking
  return null;
};

