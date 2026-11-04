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

  // Initialize Video & HLS
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setHasError(null);
    const effectiveSrc = videoUploadService.getLocalBlobForS3Url(src) || src;
    const isHlsStream = effectiveSrc.includes('.m3u8');

    // Destroy previous HLS instance if any
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (isHlsStream && Hls.isSupported()) {
      const hls = new Hls({
        capLevelToPlayerSize: true,
        autoStartLoad: true,
      });

      hls.loadSource(effectiveSrc);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
        setIsHlsActive(true);
        const levels = data.levels.map((lvl, index) => ({
          id: index,
          height: lvl.height,
          bitrate: lvl.bitrate,
        }));
        setQualityLevels(levels);
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.warn('[HLS] Network error encountered (manifest may still be processing by MediaConvert)...');
              // If HLS manifest is not yet ready, gracefully try raw MP4 source
              if (effectiveSrc.includes('/hls/')) {
                const rawMp4Candidate = effectiveSrc
                  .replace('robotics-lms-videos-processed-2026', 'robotics-lms-videos-2026')
                  .replace('/hls/master.m3u8', '.mp4');
                console.log('[HLS Fallback] Playing raw MP4 while transcoding finishes:', rawMp4Candidate);
                hls.destroy();
                video.src = rawMp4Candidate;
                setIsHlsActive(false);
                return;
              }
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.warn('[HLS] Media error encountered, recovering media...');
              hls.recoverMediaError();
              break;
            default:
              console.error('[HLS] Unrecoverable error:', data);
              setHasError('Adaptive stream processing. Displaying source feed.');
              hls.destroy();
              break;
          }
        }
      });

      hlsRef.current = hls;
    } else if (video.canPlayType('application/vnd.apple.mpegurl') && isHlsStream) {
      // Native Safari HLS
      video.src = effectiveSrc;
      setIsHlsActive(true);
    } else {
      // Standard MP4 or direct video source
      video.src = effectiveSrc;
      setIsHlsActive(false);
    }

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

