/**
 * AWS Lambda Function: getUploadUrl
 * Generates an Amazon S3 Pre-signed URL for direct browser-to-S3 video upload.
 * 
 * Target Bucket: robotics-lms-videos-2026
 * Region: ap-southeast-2
 */

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({ region: process.env.AWS_REGION || "ap-southeast-2" });
const VIDEO_BUCKET = process.env.VIDEO_BUCKET_NAME || "robotics-lms-videos-2026";

const CORS_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Amz-Date,X-Api-Key",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
};

export const handler = async (event) => {
  if (event.requestContext?.http?.method === "OPTIONS" || event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: CORS_HEADERS, body: "" };
  }

  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const { fileName, fileType, projectId } = body;

    if (!fileName || !projectId) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: "Missing required fields: fileName and projectId are required." }),
      };
    }

    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const s3Key = `projects/${projectId}/${Date.now()}-${sanitizedFileName}`;

    const command = new PutObjectCommand({
      Bucket: VIDEO_BUCKET,
      Key: s3Key,
      ContentType: fileType || "video/mp4",
    });

    // Generate pre-signed PUT URL with 15-minute expiration
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });
    const s3Url = `https://${VIDEO_BUCKET}.s3.${process.env.AWS_REGION || "ap-southeast-2"}.amazonaws.com/${s3Key}`;

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        uploadUrl,
        s3Url,
        s3Key,
        bucket: VIDEO_BUCKET,
      }),
    };
  } catch (err) {
    console.error("Error generating S3 presigned URL:", err);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: err.message || "Failed to generate presigned upload URL" }),
    };
  }
};

