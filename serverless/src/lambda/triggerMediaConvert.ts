import { S3Event } from 'aws-lambda';
import { MediaConvertClient, CreateJobCommand } from '@aws-sdk/client-mediaconvert';

const region = process.env.AWS_REGION || 'us-east-1';
const mediaConvertRoleArn = process.env.MEDIACONVERT_ROLE_ARN || '';
const mediaConvertEndpoint = process.env.MEDIACONVERT_ENDPOINT || '';
const destinationBucket = process.env.HLS_DESTINATION_BUCKET || '';

const mcClient = new MediaConvertClient({
  region,
  endpoint: mediaConvertEndpoint,
});

export const handler = async (event: S3Event): Promise<void> => {
  console.log('[triggerMediaConvert] Received S3 Event:', JSON.stringify(event));

  for (const record of event.Records) {
    const srcBucket = record.s3.bucket.name;
    const srcKey = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));

    // Only process .mp4 files
    if (!srcKey.toLowerCase().endsWith('.mp4')) {
      console.log(`[triggerMediaConvert] Skipping non-MP4 file: ${srcKey}`);
      continue;
    }

    const videoName = srcKey.split('/').pop()?.replace('.mp4', '') || `video-${Date.now()}`;
    const destinationUri = `s3://${destinationBucket}/hls/${videoName}/`;
    const inputUri = `s3://${srcBucket}/${srcKey}`;

    console.log(`[triggerMediaConvert] Submitting MediaConvert Job: ${inputUri} -> ${destinationUri}`);

    try {
      const response = await mcClient.send(
        new CreateJobCommand({
          Role: mediaConvertRoleArn,
          Settings: {
            TimecodeConfig: { Source: 'ZEROBASED' },
            OutputGroups: [
              {
                Name: 'HLS Group',
                OutputGroupSettings: {
                  Type: 'HLS_GROUP_SETTINGS',
                  HlsGroupSettings: {
                    SegmentLength: 6,
                    Destination: destinationUri,
                    DirectoryStructure: 'SINGLE_DIRECTORY',
                    ManifestDurationFormat: 'INTEGER',
                    SegmentControl: 'SEGMENTED_FILES',
                    StreamInfResolution: 'INCLUDE',
                  },
                },
                Outputs: [
                  {
                    NameModifier: '_1080p',
                    ContainerSettings: { Container: 'M3U8' },
                    VideoDescription: {
                      Width: 1920,
                      Height: 1080,
                      CodecSettings: {
                        Codec: 'H_264',
                        H264Settings: {
                          Bitrate: 5000000,
                          RateControlMode: 'CBR',
                          CodecProfile: 'HIGH',
                          CodecLevel: 'LEVEL_4_1',
                        },
                      },
                    },
                    AudioDescriptions: [
                      {
                        CodecSettings: {
                          Codec: 'AAC',
                          AacSettings: { Bitrate: 128000, CodingMode: 'CODING_MODE_2_0', SampleRate: 48000 },
                        },
                      },
                    ],
                  },
                  {
                    NameModifier: '_720p',
                    ContainerSettings: { Container: 'M3U8' },
                    VideoDescription: {
                      Width: 1280,
                      Height: 720,
                      CodecSettings: {
                        Codec: 'H_264',
                        H264Settings: {
                          Bitrate: 3000000,
                          RateControlMode: 'CBR',
                          CodecProfile: 'MAIN',
                          CodecLevel: 'LEVEL_3_1',
                        },
                      },
                    },
                    AudioDescriptions: [
                      {
                        CodecSettings: {
                          Codec: 'AAC',
                          AacSettings: { Bitrate: 128000, CodingMode: 'CODING_MODE_2_0', SampleRate: 48000 },
                        },
                      },
                    ],
                  },
                  {
                    NameModifier: '_480p',
                    ContainerSettings: { Container: 'M3U8' },
                    VideoDescription: {
                      Width: 854,
                      Height: 480,
                      CodecSettings: {
                        Codec: 'H_264',
                        H264Settings: {
                          Bitrate: 1500000,
                          RateControlMode: 'CBR',
                          CodecProfile: 'MAIN',
                          CodecLevel: 'LEVEL_3_1',
                        },
                      },
                    },
                    AudioDescriptions: [
                      {
                        CodecSettings: {
                          Codec: 'AAC',
                          AacSettings: { Bitrate: 96000, CodingMode: 'CODING_MODE_2_0', SampleRate: 48000 },
                        },
                      },
                    ],
                  },
                ],
              },
            ],
            Inputs: [
              {
                FileInput: inputUri,
                AudioSelectors: { 'Audio Selector 1': { DefaultSelection: 'DEFAULT' } },
              },
            ],
          },
        })
      );

      console.log(`[triggerMediaConvert] Job submitted successfully: ${response.Job?.Id}`);
    } catch (jobErr) {
      console.error(`[triggerMediaConvert] Failed to create MediaConvert job:`, jobErr);
    }
  }
};

