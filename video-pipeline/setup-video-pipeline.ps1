# ==============================================================================
# RoboLMS Video Pipeline Setup Automation (PowerShell)
# Architecture: S3 (Raw MP4) -> AWS Elemental MediaConvert (HLS) -> S3 (HLS) -> CloudFront
# ==============================================================================

param (
    [string]$Region = "us-east-1",
    [string]$SourceBucket = "robolms-raw-source-$((Get-Random))",
    [string]$DestBucket = "robolms-hls-output-$((Get-Random))"
)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   RoboLMS Video Pipeline: S3 + AWS Elemental MediaConvert" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Region: $Region"
Write-Host "Source Bucket: $SourceBucket"
Write-Host "Destination Bucket: $DestBucket"

# ------------------------------------------------------------------------------
# 1. Create S3 Buckets
# ------------------------------------------------------------------------------
Write-Host "`n[1/6] Creating S3 Buckets..." -ForegroundColor Yellow

# Create Source Bucket
if ($Region -eq "us-east-1") {
    aws s3api create-bucket --bucket $SourceBucket --region $Region
    aws s3api create-bucket --bucket $DestBucket --region $Region
} else {
    aws s3api create-bucket --bucket $SourceBucket --region $Region --create-bucket-configuration LocationConstraint=$Region
    aws s3api create-bucket --bucket $DestBucket --region $Region --create-bucket-configuration LocationConstraint=$Region
}

# Block public access
aws s3api put-public-access-block --bucket $SourceBucket --public-access-block-configuration "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
aws s3api put-public-access-block --bucket $DestBucket --public-access-block-configuration "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"

# Enable Default Encryption
aws s3api put-bucket-encryption --bucket $SourceBucket --server-side-encryption-configuration '{\"Rules\": [{\"ApplyServerSideEncryptionByDefault\": {\"SSEAlgorithm\": \"AES256\"}}]}'
aws s3api put-bucket-encryption --bucket $DestBucket --server-side-encryption-configuration '{\"Rules\": [{\"ApplyServerSideEncryptionByDefault\": {\"SSEAlgorithm\": \"AES256\"}}]}'

# ------------------------------------------------------------------------------
# 2. Configure CORS on Destination Bucket (Required for Browser HLS Playback)
# ------------------------------------------------------------------------------
Write-Host "`n[2/6] Configuring S3 CORS for HLS Streaming..." -ForegroundColor Yellow
aws s3api put-bucket-cors --bucket $DestBucket --cors-configuration file://video-pipeline/s3-cors.json

# ------------------------------------------------------------------------------
# 3. Create MediaConvert IAM Service Role
# ------------------------------------------------------------------------------
Write-Host "`n[3/6] Setting up MediaConvert IAM Service Role..." -ForegroundColor Yellow

$TrustPolicy = @"
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "mediaconvert.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
"@

$TrustPolicy | Out-File -FilePath "$env:TEMP\mediaconvert-trust.json" -Encoding ascii

$ROLE_NAME = "RoboLMSMediaConvertRole"
aws iam create-role --role-name $ROLE_NAME --assume-role-policy-document file://"$env:TEMP\mediaconvert-trust.json" 2>$null

$RoleArn = (aws iam get-role --role-name $ROLE_NAME --query "Role.Arn" --output text)
Write-Host "MediaConvert Role ARN: $RoleArn" -ForegroundColor Green

# Attach S3 Permissions Policy to Role
$S3Policy = @"
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::$SourceBucket",
        "arn:aws:s3:::$SourceBucket/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:PutObjectAcl",
        "s3:GetObject"
      ],
      "Resource": [
        "arn:aws:s3:::$DestBucket",
        "arn:aws:s3:::$DestBucket/*"
      ]
    }
  ]
}
"@

$S3Policy | Out-File -FilePath "$env:TEMP\mediaconvert-s3-policy.json" -Encoding ascii
aws iam put-role-policy --role-name $ROLE_NAME --policy-name "MediaConvertS3Access" --policy-document file://"$env:TEMP\mediaconvert-s3-policy.json"

# ------------------------------------------------------------------------------
# 4. Retrieve Account MediaConvert Endpoint
# ------------------------------------------------------------------------------
Write-Host "`n[4/6] Retrieving Account-specific MediaConvert Endpoint..." -ForegroundColor Yellow
$ENDPOINT = (aws mediaconvert describe-endpoints --region $Region --query "Endpoints[0].Url" --output text)
Write-Host "MediaConvert API Endpoint: $ENDPOINT" -ForegroundColor Green

# ------------------------------------------------------------------------------
# 5. Instructions for Running a Job
# ------------------------------------------------------------------------------
Write-Host "`n[5/6] Preparing MediaConvert Job Template..." -ForegroundColor Yellow

# Replace bucket placeholders in mediaconvert-job.json
$JobJson = Get-Content -Path "video-pipeline/mediaconvert-job.json" -Raw
$JobJson = $JobJson.Replace("YOUR_SOURCE_BUCKET_NAME", $SourceBucket)
$JobJson = $JobJson.Replace("YOUR_DESTINATION_BUCKET_NAME", $DestBucket)
$JobJson | Set-Content -Path "video-pipeline/mediaconvert-job.configured.json"

Write-Host "Configured payload written to: video-pipeline/mediaconvert-job.configured.json"

# ------------------------------------------------------------------------------
# 6. Complete
# ------------------------------------------------------------------------------
Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host " Pipeline Ready! To transcode a video, run:" -ForegroundColor Green
Write-Host " aws mediaconvert create-job --endpoint-url $ENDPOINT --role $RoleArn --settings file://video-pipeline/mediaconvert-job.configured.json --region $Region" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Green

