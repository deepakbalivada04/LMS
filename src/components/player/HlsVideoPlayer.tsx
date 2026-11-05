import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { videoUploadService } from '../../services/videoUploadService';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  Settings, 
  RotateCcw, 
  Gauge, 
  Radio, 
  AlertCircle 
} from 'lucide-react';

interface HlsVideoPlayerProps {
  src: string;
  title: string;
  onEnded?: () => void;
  poster?: string;
}

export const HlsVideoPlayer: React.FC<HlsVideoPlayerProps> = ({
  src,
  title,
  onEnded,
  poster,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.9);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [isHlsActive, setIsHlsActive] = useState(false);
  const [qualityLevels, setQualityLevels] = useState<{ id: number; height: number; bitrate: number }[]>([]);
  const [currentQuality, setCurrentQuality] = useState<number>(-1); // -1 = Auto
  const [hasError, setHasError] = useState<string | null>(null);

  const controlsTimeoutRef = useRef<any>(null);

  // Helper to generate ordered candidate HLS URLs for an input source
  const getCandidateHlsUrls = (rawSource: string): string[] => {
    if (rawSource.startsWith('blob:')) return [rawSource];

    const candidates: string[] = [];

    // If source is already an .m3u8 URL
    if (rawSource.includes('.m3u8')) {
      candidates.push(rawSource);
      // Also derive baseName.m3u8 if it was given master.m3u8
      if (rawSource.includes('/hls/master.m3u8')) {
        const parts = rawSource.split('/');
        const hlsIdx = parts.indexOf('hls');
        if (hlsIdx > 0) {
          const folderName = parts[hlsIdx - 1];
          candidates.push(rawSource.replace('/hls/master.m3u8', `/hls/${folderName}.m3u8`));
        }
      }
      return candidates;
    }

    // If source is an S3 MP4 URL (e.g. projects/.../1793905763827-gemini_generated_video_fac0cdb7.mp4)
    if (rawSource.includes('robotics-lms-videos-2026') || rawSource.includes('robotics-lms-videos-processed-2026')) {
      const withoutExt = rawSource.replace(/\.[a-zA-Z0-9]+$/, '');
      const cleanFolder = withoutExt.replace('robotics-lms-videos-2026', 'robotics-lms-videos-processed-2026');
      const baseName = withoutExt.split('/').pop() || '';

      // 1. Primary: Exact MediaConvert output name (e.g. .../hls/1793905763827-video.m3u8)
      if (baseName) {
        candidates.push(`${cleanFolder}/hls/${baseName}.m3u8`);
      }
      // 2. Secondary: master.m3u8
      candidates.push(`${cleanFolder}/hls/master.m3u8`);
      // 3. Fallback: .m3u8
      candidates.push(`${cleanFolder}/hls/.m3u8`);
      // 4. Raw MP4 fallback
      candidates.push(rawSource);

      return candidates;
    }

    return [rawSource];
  };

  // Initialize Video & HLS
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setHasError(null);
    const localBlob = videoUploadService.getLocalBlobForS3Url(src);
    if (localBlob) {
      video.src = localBlob;
      setIsHlsActive(false);
      return;
    }

    // Destroy previous HLS instance if any
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const candidateUrls = getCandidateHlsUrls(src);
    let candidateIndex = 0;

    const tryNextStream = () => {
      if (candidateIndex >= candidateUrls.length) {
        setHasError('Stream connection error. Please verify S3 video files.');
        return;
      }

      const currentTarget = candidateUrls[candidateIndex];
      candidateIndex++;

      console.log(`[Player] Attempting video stream [${candidateIndex}/${candidateUrls.length}]:`, currentTarget);

      if (currentTarget.includes('.m3u8') && Hls.isSupported()) {
        if (hlsRef.current) {
          hlsRef.current.destroy();
          hlsRef.current = null;
        }

        const hls = new Hls({
          capLevelToPlayerSize: true,
          autoStartLoad: true,
        });

        hls.loadSource(currentTarget);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
          console.log('[HLS] Stream connected and manifest parsed:', currentTarget);
          setIsHlsActive(true);
          setHasError(null);
          const levels = data.levels.map((lvl, index) => ({
            id: index,
            height: lvl.height,
            bitrate: lvl.bitrate,
          }));
          setQualityLevels(levels);
        });

        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
            console.warn('[HLS] Stream failed on:', currentTarget, data.type);
            hls.destroy();
            hlsRef.current = null;
            // Advance to next stream candidate
            tryNextStream();
          }
        });

        hlsRef.current = hls;
      } else if (video.canPlayType('application/vnd.apple.mpegurl') && currentTarget.includes('.m3u8')) {
        // Native Safari HLS
        video.src = currentTarget;
        setIsHlsActive(true);
      } else {
        // Standard MP4 fallback
        console.log('[Player] Playing direct video format:', currentTarget);
        video.src = currentTarget;
        setIsHlsActive(false);
      }
    };

    tryNextStream();

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src]);

  // Video event handlers
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = targetTime;
      setCurrentTime(targetTime);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (videoRef.current) {
      videoRef.current.volume = newVol;
      setIsMuted(newVol === 0);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.muted = false;
      videoRef.current.volume = volume || 0.5;
      setIsMuted(false);
    } else {
      videoRef.current.muted = true;
      setIsMuted(true);
    }
  };

  const handleSpeedChange = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackRate(speed);
    }
    setShowSettings(false);
  };

  const handleQualityChange = (levelId: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelId;
      setCurrentQuality(levelId);
    }
    setShowSettings(false);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(console.error);
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(console.error);
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 2800);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-slate-800 shadow-2xl select-none group"
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        poster={poster}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => {
          setIsPlaying(false);
          if (onEnded) onEnded();
        }}
        onClick={togglePlay}
        className="w-full h-full object-contain cursor-pointer"
        playsInline
      />

      {/* HLS / Stream Indicator Badge */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <div className="px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-800 text-[10px] font-mono text-cyan-400 flex items-center gap-1.5 shadow">
          <Radio className={`w-3 h-3 ${isHlsActive ? 'text-cyan-400 animate-pulse' : 'text-slate-400'}`} />
          <span>{isHlsActive ? 'AWS CloudFront HLS' : 'Direct Video Stream'}</span>
        </div>
      </div>

      {/* Stream Warning / Error Toast */}
      {hasError && (
        <div className="absolute top-4 right-4 z-20 px-3 py-1.5 rounded-xl bg-amber-950/90 border border-amber-600/50 text-amber-300 text-xs font-mono flex items-center gap-2 shadow-lg">
          <AlertCircle className="w-4 h-4 text-amber-400" />
          <span>{hasError}</span>
        </div>
      )}

      {/* Center Big Play Button (when paused) */}
      {!isPlaying && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-cyan-500/90 hover:bg-cyan-400 text-slate-950 flex items-center justify-center transition-transform hover:scale-110 shadow-lg shadow-cyan-500/30 z-10"
        >
          <Play className="w-8 h-8 fill-current ml-1" />
        </button>
      )}

      {/* Bottom Controls Overlay */}
      <div
        className={`absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-slate-950/95 via-slate-950/70 to-transparent p-4 transition-opacity duration-300 ${
          showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Scrubber Bar */}
        <div className="relative mb-3 flex items-center group/scrubber">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-slate-700/60 rounded-lg appearance-none cursor-pointer accent-cyan-400 hover:h-2 transition-all"
          />
        </div>

        {/* Buttons and Time */}
        <div className="flex items-center justify-between text-slate-200">
          {/* Left Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-white transition"
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
            </button>

            <button
              onClick={() => {
                if (videoRef.current) videoRef.current.currentTime = Math.max(0, currentTime - 10);
              }}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
              title="Skip back 10 seconds"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Volume */}
            <div className="flex items-center gap-2 group/volume">
              <button
                onClick={toggleMute}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition"
              >
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400 hidden group-hover/volume:block transition-all"
              />
            </div>

            {/* Time Stamp */}
            <span className="text-xs font-mono text-slate-400 ml-1">
              {formatTime(currentTime)} <span className="text-slate-600">/</span> {formatTime(duration)}
            </span>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 relative">
            {/* Speed / Quality Settings Dropdown */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-1.5 rounded-lg hover:bg-slate-800 transition ${
                showSettings ? 'text-cyan-400 bg-slate-800' : 'text-slate-300'
              }`}
              title="Player Settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            {showSettings && (
              <div className="absolute right-0 bottom-10 w-52 bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-2xl z-30 font-mono text-xs">
                {/* Playback speed selector */}
                <div className="mb-3">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1 font-semibold">
                    <Gauge className="w-3 h-3 text-cyan-400" />
                    Playback Speed
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    {[0.75, 1, 1.25, 1.5, 2].map((speed) => (
                      <button
                        key={speed}
                        onClick={() => handleSpeedChange(speed)}
                        className={`py-1 rounded text-[11px] transition ${
                          playbackRate === speed
                            ? 'bg-cyan-500 text-slate-950 font-bold'
                            : 'bg-slate-950 text-slate-400 hover:text-white'
                        }`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* HLS Quality Levels (if available) */}
                {qualityLevels.length > 0 && (
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1 font-semibold">
                      <Radio className="w-3 h-3 text-cyan-400" />
                      Stream Quality
                    </div>
                    <div className="space-y-1">
                      <button
                        onClick={() => handleQualityChange(-1)}
                        className={`w-full text-left px-2 py-1 rounded text-[11px] transition ${
                          currentQuality === -1
                            ? 'bg-cyan-500 text-slate-950 font-bold'
                            : 'bg-slate-950 text-slate-400 hover:text-white'
                        }`}
                      >
                        Auto (Adaptive ABR)
                      </button>
                      {qualityLevels.map((lvl) => (
                        <button
                          key={lvl.id}
                          onClick={() => handleQualityChange(lvl.id)}
                          className={`w-full text-left px-2 py-1 rounded text-[11px] transition ${
                            currentQuality === lvl.id
                              ? 'bg-cyan-500 text-slate-950 font-bold'
                              : 'bg-slate-950 text-slate-400 hover:text-white'
                          }`}
                        >
                          {lvl.height}p ({Math.round(lvl.bitrate / 1000)} kbps)
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

