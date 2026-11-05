import { awsConfig } from '../aws-exports';

export interface UploadVideoOptions {
  file: File;
  projectId: string;
  stageId?: string;
  onProgress?: (percent: number, loadedBytes: number, totalBytes: number) => void;
}

export interface UploadVideoResult {
  s3Url: string;
  s3Key: string;
  bucket: string;
  durationMinutes: number;
  fileName: string;
  fileSizeBytes: number;
  localPlaybackUrl: string;
  hlsUrl?: string;
}

// Global in-memory cache to allow instant local playback of uploaded files
const LOCAL_BLOB_CACHE = new Map<string, string>();

export const videoUploadService = {
  /**
   * Automatically detect video duration using the browser's HTML5 video engine
   */
  detectVideoDuration(file: File): Promise<number> {
    return new Promise((resolve) => {
      try {
        const video = document.createElement('video');
        video.preload = 'metadata';
        const url = URL.createObjectURL(file);
        video.src = url;

        video.onloadedmetadata = () => {
          URL.revokeObjectURL(url);
          const durationMins = Math.max(1, Math.round(video.duration / 60));
          resolve(durationMins);
        };

        video.onerror = () => {
          URL.revokeObjectURL(url);
          resolve(20); // Fallback default 20 minutes
        };

        // Timeout fallback after 4 seconds
        setTimeout(() => {
          resolve(20);
        }, 4000);
      } catch {
        resolve(20);
      }
    });
  },

  /**
   * Upload video file directly to Amazon S3 via Pre-signed URL
   */
  async uploadVideoToS3(options: UploadVideoOptions): Promise<UploadVideoResult> {
    const { file, projectId, onProgress } = options;
    const bucket = awsConfig.videoS3Bucket || 'robotics-lms-videos-2026';
    const region = awsConfig.region || 'ap-southeast-2';
    const uploadApiUrl = awsConfig.getUploadUrlApi;

    // Detect duration in minutes
    const durationMinutes = await this.detectVideoDuration(file);
    const localPlaybackUrl = URL.createObjectURL(file);

    // If API Gateway endpoint is provided, execute REAL S3 Pre-Signed Upload
    if (uploadApiUrl) {
      console.log(`[S3 Upload] Requesting pre-signed URL for ${file.name}...`);
      
      let presignResponse: Response | null = null;
      let lastError: Error | null = null;

      // In local dev, use the Vite proxy first to avoid browser preflight CORS restrictions
      const candidateUrls = import.meta.env.DEV
        ? ['/api-upload/getVideoUploadUrl', uploadApiUrl]
        : [uploadApiUrl];

      for (const endpoint of candidateUrls) {
        try {
          console.log(`[S3 Upload] Calling presign endpoint: ${endpoint}`);
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              fileName: file.name,
              fileType: file.type || 'video/mp4',
              projectId: projectId,
            }),
          });
          if (res.ok) {
            presignResponse = res;
            break;
          } else {
            const errText = await res.text();
            lastError = new Error(`HTTP ${res.status}: ${errText}`);
          }
        } catch (fetchErr: any) {
          console.warn(`[S3 Upload] Fetch attempt failed on ${endpoint}:`, fetchErr.message);
          lastError = fetchErr;
        }
      }

      if (!presignResponse) {
        throw new Error(
          `Could not connect to S3 presign API (${lastError?.message || 'CORS / Network Error'}). If uploading from localhost, ensure the Vite dev proxy is active or enable CORS on API Gateway.`
        );
      }

      const presignData = await presignResponse.json();
      const { uploadUrl, s3Url, s3Key } = presignData;

      console.log(`[S3 Upload] Pre-signed upload authorization received. Uploading ${file.size} bytes directly to Amazon S3...`);

      // Upload raw binary bytes directly to S3 via PUT
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', uploadUrl, true);
        xhr.setRequestHeader('Content-Type', file.type || 'video/mp4');

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable && onProgress) {
            const percent = Math.min(100, Math.round((e.loaded / e.total) * 100));
            onProgress(percent, e.loaded, e.total);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            console.log(`[S3 Upload] Successfully uploaded ${file.name} to S3: ${s3Url}`);
            resolve();
          } else {
            console.error('[S3 Upload] S3 PUT failed:', xhr.status, xhr.responseText);
            reject(
              new Error(
                `S3 upload failed with HTTP ${xhr.status}. Make sure S3 bucket "${bucket}" has CORS configured to allow PUT from this origin.`
              )
            );
          }
        };

        xhr.onerror = () => {
          console.error('[S3 Upload] Network error while uploading to S3.');
          reject(
            new Error(
              'Network error during S3 upload. Make sure your S3 bucket permissions allow CORS PUT requests.'
            )
          );
        };

        xhr.send(file);
      });

      // Calculate expected MediaConvert HLS destination playlist
      const cleanKey = s3Key.substring(0, s3Key.lastIndexOf('.')) || s3Key;
      const fileNameWithoutExt = cleanKey.split('/').pop() || 'master';
      const hlsUrl = `https://robotics-lms-videos-processed-2026.s3.${region}.amazonaws.com/${cleanKey}/hls/${fileNameWithoutExt}.m3u8`;

      // Cache the local blob against both the raw S3 URL and the HLS URL so playback is instant
      LOCAL_BLOB_CACHE.set(s3Url, localPlaybackUrl);
      LOCAL_BLOB_CACHE.set(hlsUrl, localPlaybackUrl);

      return {
        s3Url,
        s3Key,
        bucket,
        durationMinutes,
        fileName: file.name,
        fileSizeBytes: file.size,
        localPlaybackUrl,
        hlsUrl,
      };
    }

    // Fallback if user has not yet plugged in the getUploadUrl API endpoint
    console.warn('[S3 Upload] VITE_GET_UPLOAD_URL_API is not configured in .env yet.');
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const s3Key = `projects/${projectId}/${Date.now()}-${sanitizedName}`;
    const s3Url = `https://${bucket}.s3.${region}.amazonaws.com/${s3Key}`;

    LOCAL_BLOB_CACHE.set(s3Url, localPlaybackUrl);

    // Alert user that the backend endpoint is needed for the bytes to physically reach S3
    throw new Error(
      `S3 Upload API Endpoint missing! Please set VITE_GET_UPLOAD_URL_API in your .env file with your API Gateway endpoint for getVideoUploadUrl.`
    );
  },

  /**
   * Get cached blob URL for an S3 URL if uploaded in this browser session
   */
  getLocalBlobForS3Url(s3Url: string): string | undefined {
    return LOCAL_BLOB_CACHE.get(s3Url);
  },

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },
};
