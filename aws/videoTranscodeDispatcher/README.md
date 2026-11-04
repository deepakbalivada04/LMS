# Serverless AWS Elemental MediaConvert HLS Pipeline

This pipeline automatically converts raw MP4 video uploads into multi-bitrate Adaptive Bitrate (ABR) Apple HLS (`.m3u8` and `.ts` segments) for smooth, buffer-free playback in the React LMS across mobile and high-speed connections.

## Architecture

1. **Source S3 Bucket:** `robotics-lms-videos-2026` (Raw `.mp4` uploads)
2. **S3 Trigger:** `s3:ObjectCreated:*` with suffix `.mp4`
3. **Dispatcher Lambda:** `videoTranscodeDispatcher` (Node.js 20.x, AWS SDK v3)
4. **Transcoder Service:** AWS Elemental MediaConvert
5. **Destination S3 Bucket:** `robotics-lms-videos-processed-2026` (HLS Output)
6. **LMS Player:** React HLS player streaming `index.m3u8` with 1080p, 720p, and 480p streams.

---

## Deployment Steps

### Step 1: Create Destination S3 Bucket
1. Open S3 in AWS Console (Region: `ap-southeast-2`).
2. Create bucket: `robotics-lms-videos-processed-2026`.
3. Enable CORS on `robotics-lms-videos-processed-2026`:
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": ["ETag", "Content-Range", "Accept-Ranges"]
  }
]
```

---

### Step 2: Create MediaConvert Service Role (`MediaConvert_Default_Role`)
1. Go to **IAM Console** > **Roles** > **Create Role**.
2. Select **Custom trust policy** and paste `mediaconvert-trust-policy.json`.
3. Click **Next**.
4. In Permissions, click **Create Policy** (JSON) and paste `mediaconvert-policy.json`. Name it `MediaConvertS3AccessPolicy`.
5. Attach this policy to the role.
6. Name the role: `MediaConvert_Default_Role`.
7. Copy the Role ARN: e.g. `arn:aws:iam::123456789012:role/MediaConvert_Default_Role`.

---

### Step 3: Create the Dispatcher Lambda Function
1. Go to **AWS Lambda Console** > **Create function**.
2. Name: `videoTranscodeDispatcher`.
3. Runtime: **Node.js 20.x**.
4. Architecture: **x86_64** or **arm64**.
5. Execution Role:
   - Attach policies from `lambda-policy.json` (or attach `AWSLambdaBasicExecutionRole` plus the inline S3/MediaConvert permissions).
6. Upload the deployment package:
   - Upload `aws/videoTranscodeDispatcher/function.zip` (contains `index.mjs` and `package.json`).
7. Configuration > Environment Variables:
   - `DESTINATION_BUCKET`: `robotics-lms-videos-processed-2026`
   - `MEDIACONVERT_ROLE_ARN`: `arn:aws:iam::<YOUR_ACCOUNT_ID>:role/MediaConvert_Default_Role`
   - `AWS_REGION`: `ap-southeast-2`

---

### Step 4: Configure S3 Event Notification Trigger
1. Open the source bucket: `robotics-lms-videos-2026`.
2. Go to the **Properties** tab.
3. Scroll down to **Event notifications** > **Create event notification**.
4. Settings:
   - Event name: `TriggerMediaConvertHLS`
   - Prefix: `projects/` (optional, to match project uploads)
   - Suffix: `.mp4`
   - Event types: Check **All object create events** (`s3:ObjectCreated:*`).
   - Destination: **Lambda function** > select `videoTranscodeDispatcher`.
5. Click **Save changes**.

