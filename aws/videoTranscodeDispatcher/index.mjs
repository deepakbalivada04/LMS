/**
 * AWS Lambda Function: videoTranscodeDispatcher
 * Runtime: Node.js 20.x (ES Modules)
 *
 * Trigger: Amazon S3 ObjectCreated event on source bucket (robotics-lms-videos-2026)
 * Destination: Transcoded Apple HLS streams (.m3u8 + .ts) written to robotics-lms-videos-processed-2026
 * Transcoder: AWS Elemental MediaConvert (Serverless)
 */

import {
  MediaConvertClient,
  CreateJobCommand,
  DescribeEndpointsCommand,
} from "@aws-sdk/client-mediaconvert";

// Region and Buckets from environment variables
const AWS_REGION = process.env.AWS_REGION || "ap-southeast-2";
const DESTINATION_BUCKET = process.env.DESTINATION_BUCKET || "robotics-lms-videos-processed-2026";
const MEDIACONVERT_ROLE_ARN = process.env.MEDIACONVERT_ROLE_ARN; // e.g. arn:aws:iam::123456789012:role/MediaConvert_Default_Role

// In-memory cache for customer's unique regional MediaConvert endpoint
let cachedEndpoint = process.env.MEDIACONVERT_ENDPOINT || null;

/**
 * Retrieves the regional customer-specific MediaConvert API endpoint
 */
async function getMediaConvertEndpoint() {
  if (cachedEndpoint) {
    return cachedEndpoint;
  }

  const defaultClient = new MediaConvertClient({ region: AWS_REGION });
  const response = await defaultClient.send(
    new DescribeEndpointsCommand({ MaxResults: 1 })
  );

  if (!response.Endpoints || response.Endpoints.length === 0) {
    throw new Error("Unable to retrieve AWS Elemental MediaConvert endpoint.");
  }

  cachedEndpoint = response.Endpoints[0].Url;
  console.log(`[MediaConvert] Resolved customer endpoint: ${cachedEndpoint}`);
  return cachedEndpoint;
}

export const handler = async (event) => {
  console.log("[Trigger] Received S3 Event:", JSON.stringify(event, null, 2));

  // Verify S3 Event record presence
  if (!event.Records || event.Records.length === 0) {
    console.log("[Skip] No S3 event records found.");
    return { statusCode: 200, body: "No S3 records." };
  }

  const s3Record = event.Records[0].s3;
  const sourceBucket = s3Record.bucket.name;
  // S3 encodes spaces as '+' or URL encoded characters
  const sourceKey = decodeURIComponent(s3Record.object.key.replace(/\+/g, " "));

  console.log(`[Source] Processing new upload: s3://${sourceBucket}/${sourceKey}`);

  // Validate that the uploaded file is a raw video file
  const videoExtensions = [".mp4", ".mov", ".mkv", ".webm", ".m4v"];
  const isVideoFile = videoExtensions.some((ext) => sourceKey.toLowerCase().endsWith(ext));

  if (!isVideoFile) {
    console.log(`[Skip] Object "${sourceKey}" is not a recognized video format. Ignoring.`);
    return { statusCode: 200, body: `Ignored non-video file: ${sourceKey}` };
  }

  // Prevent infinite recursive triggers if same bucket is mistakenly used
  if (sourceKey.includes("/hls/") || sourceKey.endsWith(".m3u8") || sourceKey.endsWith(".ts")) {
    console.log(`[Skip] Object "${sourceKey}" appears to already be an HLS asset.`);
    return { statusCode: 200, body: "Ignored HLS file." };
  }

  // Derive clean path for HLS output
  // e.g. projects/crs-esp32-rover/1730761234-chassis_assembly.mp4
  // -> destination: s3://robotics-lms-videos-processed-2026/projects/crs-esp32-rover/1730761234-chassis_assembly/hls/master
  const cleanPath = sourceKey.substring(0, sourceKey.lastIndexOf("."));
  const destinationPrefix = `s3://${DESTINATION_BUCKET}/${cleanPath}/hls/master`;

  if (!MEDIACONVERT_ROLE_ARN) {
    throw new Error(
      "Missing MEDIACONVERT_ROLE_ARN environment variable. Please specify the IAM role ARN for MediaConvert."
    );
  }

  // 1. Resolve MediaConvert regional endpoint
  const endpoint = await getMediaConvertEndpoint();
  const mediaConvertClient = new MediaConvertClient({
    region: AWS_REGION,
    endpoint: endpoint,
  });

  // 2. Build the MediaConvert Job JSON Payload (Adaptive Bitrate HLS Ladder: 1080p, 720p, 480p)
  const jobParams = {
    Role: MEDIACONVERT_ROLE_ARN,
    Settings: {
      TimecodeConfig: {
        Source: "ZEROBASED",
      },
      Inputs: [
        {
          AudioSelectors: {
            "Audio Selector 1": {
              DefaultSelection: "DEFAULT",
            },
          },
          VideoSelector: {},
          TimecodeSource: "ZEROBASED",
          FileInput: `s3://${sourceBucket}/${sourceKey}`,
        },
      ],
      OutputGroups: [
        {
          Name: "Apple HLS",
          OutputGroupSettings: {
            Type: "HLS_GROUP_SETTINGS",
            HlsGroupSettings: {
              SegmentLength: 6, // 6-second segments for responsive seeking & low latency
              MinSegmentLength: 0,
              Destination: destinationPrefix,
              SegmentControl: "SEGMENTED_FILES",
              ManifestDurationFormat: "INTEGER",
              StreamInfResolution: "INCLUDE",
              ClientCache: "ENABLED",
              CodecSpecification: "RFC_4281",
              OutputSelection: "MANIFESTS_AND_SEGMENTS",
              DirectoryStructure: "SINGLE_DIRECTORY",
            },
          },
          Outputs: [
            // ==========================================
            // 1. 1080p Full HD Stream (5000 kbps)
            // ==========================================
            {
              NameModifier: "_1080p",
              ContainerSettings: {
                Container: "M3U8",
                M3u8Settings: {
                  AudioFramesPerPes: 4,
                  PcrControl: "PCR_EVERY_PES_PACKET",
                  PmtPid: 480,
                  PrivateMetadataPid: 503,
                  ProgramNumber: 1,
                  PatInterval: 0,
                  PmtInterval: 0,
                  VideoPid: 481,
                  AudioPids: [482, 483, 484],
                },
              },
              VideoDescription: {
                Width: 1920,
                Height: 1080,
                ScalingBehavior: "DEFAULT",
                TimecodeInsertion: "DISABLED",
                AntiAlias: "ENABLED",
                Sharpness: 50,
                CodecSettings: {
                  Codec: "H_264",
                  H264Settings: {
                    InterlaceMode: "PROGRESSIVE",
                    NumberReferenceFrames: 3,
                    Syntax: "DEFAULT",
                    Softness: 0,
                    GopClosedCadence: 1,
                    GopSize: 60, // 2-second GOP for 30fps
                    GopBReference: "DISABLED",
                    SlowPal: "DISABLED",
                    SpatialAdaptiveQuantization: "ENABLED",
                    TemporalAdaptiveQuantization: "ENABLED",
                    FlickerAdaptiveQuantization: "DISABLED",
                    EntropyEncoding: "CABAC",
                    Bitrate: 5000000, // 5 Mbps
                    FramerateControl: "INITIALIZE_FROM_SOURCE",
                    RateControlMode: "CBR",
                    CodecProfile: "HIGH",
                    Telecine: "NONE",
                    MinIInterval: 0,
                    AdaptiveQuantization: "HIGH",
                    CodecLevel: "AUTO",
                    FieldEncoding: "PAFF",
                    SceneChangeDetect: "ENABLED",
                    QualityTuningLevel: "SINGLE_PASS",
                    FramerateConversionAlgorithm: "DUPLICATE_DROP",
                    UnregisteredSeiTimecode: "DISABLED",
                  },
                },
                AfdSignaling: "NONE",
                DropFrameTimecode: "ENABLED",
                RespondToAfd: "NONE",
                ColorMetadata: "INSERT",
              },
              AudioDescriptions: [
                {
                  AudioTypeControl: "FOLLOW_INPUT",
                  AudioSourceName: "Audio Selector 1",
                  CodecSettings: {
                    Codec: "AAC",
                    AacSettings: {
                      AudioDescriptionBroadcasterMix: "NORMAL",
                      Bitrate: 128000,
                      RateControlMode: "CBR",
                      CodecProfile: "LC",
                      CodingMode: "CODING_MODE_2_0",
                      SampleRate: 48000,
                      RawFormat: "NONE",
                      Specification: "MPEG4",
                    },
                  },
                  LanguageCodeControl: "FOLLOW_INPUT",
                },
              ],
            },

            // ==========================================
            // 2. 720p HD Stream (3000 kbps)
            // ==========================================
            {
              NameModifier: "_720p",
              ContainerSettings: {
                Container: "M3U8",
                M3u8Settings: {
                  AudioFramesPerPes: 4,
                  PcrControl: "PCR_EVERY_PES_PACKET",
                  PmtPid: 480,
                  PrivateMetadataPid: 503,
                  ProgramNumber: 1,
                  PatInterval: 0,
                  PmtInterval: 0,
                  VideoPid: 481,
                  AudioPids: [482, 483, 484],
                },
              },
              VideoDescription: {
                Width: 1280,
                Height: 720,
                ScalingBehavior: "DEFAULT",
                TimecodeInsertion: "DISABLED",
                AntiAlias: "ENABLED",
                Sharpness: 50,
                CodecSettings: {
                  Codec: "H_264",
                  H264Settings: {
                    InterlaceMode: "PROGRESSIVE",
                    NumberReferenceFrames: 3,
                    Syntax: "DEFAULT",
                    Softness: 0,
                    GopClosedCadence: 1,
                    GopSize: 60,
                    GopBReference: "DISABLED",
                    SlowPal: "DISABLED",
                    SpatialAdaptiveQuantization: "ENABLED",
                    TemporalAdaptiveQuantization: "ENABLED",
                    FlickerAdaptiveQuantization: "DISABLED",
                    EntropyEncoding: "CABAC",
                    Bitrate: 3000000, // 3 Mbps
                    FramerateControl: "INITIALIZE_FROM_SOURCE",
                    RateControlMode: "CBR",
                    CodecProfile: "MAIN",
                    Telecine: "NONE",
                    MinIInterval: 0,
                    AdaptiveQuantization: "HIGH",
                    CodecLevel: "AUTO",
                    FieldEncoding: "PAFF",
                    SceneChangeDetect: "ENABLED",
                    QualityTuningLevel: "SINGLE_PASS",
                    FramerateConversionAlgorithm: "DUPLICATE_DROP",
                    UnregisteredSeiTimecode: "DISABLED",
                  },
                },
                AfdSignaling: "NONE",
                DropFrameTimecode: "ENABLED",
                RespondToAfd: "NONE",
                ColorMetadata: "INSERT",
              },
              AudioDescriptions: [
                {
                  AudioTypeControl: "FOLLOW_INPUT",
                  AudioSourceName: "Audio Selector 1",
                  CodecSettings: {
                    Codec: "AAC",
                    AacSettings: {
                      AudioDescriptionBroadcasterMix: "NORMAL",
                      Bitrate: 128000,
                      RateControlMode: "CBR",
                      CodecProfile: "LC",
                      CodingMode: "CODING_MODE_2_0",
                      SampleRate: 48000,
                      RawFormat: "NONE",
                      Specification: "MPEG4",
                    },
                  },
                  LanguageCodeControl: "FOLLOW_INPUT",
                },
              ],
            },

            // ==========================================
            // 3. 480p SD Stream (1200 kbps - Mobile / Low Bandwidth)
            // ==========================================
            {
              NameModifier: "_480p",
              ContainerSettings: {
                Container: "M3U8",
                M3u8Settings: {
                  AudioFramesPerPes: 4,
                  PcrControl: "PCR_EVERY_PES_PACKET",
                  PmtPid: 480,
                  PrivateMetadataPid: 503,
                  ProgramNumber: 1,
                  PatInterval: 0,
                  PmtInterval: 0,
                  VideoPid: 481,
                  AudioPids: [482, 483, 484],
                },
              },
              VideoDescription: {
                Width: 854,
                Height: 480,
                ScalingBehavior: "DEFAULT",
                TimecodeInsertion: "DISABLED",
                AntiAlias: "ENABLED",
                Sharpness: 50,
                CodecSettings: {
                  Codec: "H_264",
                  H264Settings: {
                    InterlaceMode: "PROGRESSIVE",
                    NumberReferenceFrames: 3,
                    Syntax: "DEFAULT",
                    Softness: 0,
                    GopClosedCadence: 1,
                    GopSize: 60,
                    GopBReference: "DISABLED",
                    SlowPal: "DISABLED",
                    SpatialAdaptiveQuantization: "ENABLED",
                    TemporalAdaptiveQuantization: "ENABLED",
                    FlickerAdaptiveQuantization: "DISABLED",
                    EntropyEncoding: "CABAC",
                    Bitrate: 1200000, // 1.2 Mbps
                    FramerateControl: "INITIALIZE_FROM_SOURCE",
                    RateControlMode: "CBR",
                    CodecProfile: "MAIN",
                    Telecine: "NONE",
                    MinIInterval: 0,
                    AdaptiveQuantization: "HIGH",
                    CodecLevel: "AUTO",
                    FieldEncoding: "PAFF",
                    SceneChangeDetect: "ENABLED",
                    QualityTuningLevel: "SINGLE_PASS",
                    FramerateConversionAlgorithm: "DUPLICATE_DROP",
                    UnregisteredSeiTimecode: "DISABLED",
                  },
                },
                AfdSignaling: "NONE",
                DropFrameTimecode: "ENABLED",
                RespondToAfd: "NONE",
                ColorMetadata: "INSERT",
              },
              AudioDescriptions: [
                {
                  AudioTypeControl: "FOLLOW_INPUT",
                  AudioSourceName: "Audio Selector 1",
                  CodecSettings: {
                    Codec: "AAC",
                    AacSettings: {
                      AudioDescriptionBroadcasterMix: "NORMAL",
                      Bitrate: 96000,
                      RateControlMode: "CBR",
                      CodecProfile: "LC",
                      CodingMode: "CODING_MODE_2_0",
                      SampleRate: 48000,
                      RawFormat: "NONE",
                      Specification: "MPEG4",
                    },
                  },
                  LanguageCodeControl: "FOLLOW_INPUT",
                },
              ],
            },
          ],
        },
      ],
    },
    UserMetadata: {
      application: "RoboAcademy-LMS",
      sourceBucket: sourceBucket,
      sourceKey: sourceKey,
      destinationBucket: DESTINATION_BUCKET,
    },
  };

  console.log("[MediaConvert] Submitting Transcoding Job...");
  const command = new CreateJobCommand(jobParams);
  const response = await mediaConvertClient.send(command);

  const jobId = response.Job?.Id;
  const masterPlaylistUrl = `https://${DESTINATION_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${cleanPath}/hls/master.m3u8`;

  console.log(`[MediaConvert] Job successfully created! Job ID: ${jobId}`);
  console.log(`[HLS Destination] Output Playlist: ${masterPlaylistUrl}`);

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "MediaConvert HLS transcoding job submitted successfully.",
      jobId: jobId,
      input: `s3://${sourceBucket}/${sourceKey}`,
      outputDestination: destinationPrefix,
      masterPlaylistUrl: masterPlaylistUrl,
    }),
  };
};

