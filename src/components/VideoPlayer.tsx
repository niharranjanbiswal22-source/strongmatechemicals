"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  RotateCcw,
  AlertTriangle,
  Lock,
  CheckCircle2,
  EyeOff,
  FastForward,
} from "lucide-react";
import WatermarkOverlay from "./WatermarkOverlay";
import ConfidentialModal from "./ConfidentialModal";

interface VideoPlayerProps {
  videoId: string;
  videoTitle: string;
  initialPosition?: number;
  empName: string;
  empId: string;
  sessionId?: string;
  ipAddress?: string;
  onCompleted?: () => void;
}

export default function VideoPlayer({
  videoId,
  videoTitle,
  initialPosition = 0,
  empName,
  empId,
  sessionId,
  ipAddress,
  onCompleted,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  const [hasAgreedConfidentiality, setHasAgreedConfidentiality] = useState(false);
  const [showConfidentialModal, setShowConfidentialModal] = useState(true);
  const [isTabUnfocused, setIsTabUnfocused] = useState(false);
  const [resumePrompt, setResumePrompt] = useState<number | null>(initialPosition > 10 ? initialPosition : null);

  const [watchedPercent, setWatchedPercent] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // Fetch signed stream token on mount
  useEffect(() => {
    async function fetchStreamToken() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/videos/signed-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ videoId }),
        });

        const data = await res.json();
        if (!res.ok || data.error) {
          throw new Error(data.error || "Failed to authorize video playback");
        }

        setStreamUrl(data.streamUrl);
      } catch (err: any) {
        setError(err.message || "Unable to load protected training video.");
      } finally {
        setLoading(false);
      }
    }

    fetchStreamToken();
  }, [videoId]);

  // Deterrence: Tab focus / window blur detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsTabUnfocused(true);
        if (videoRef.current && !videoRef.current.paused) {
          videoRef.current.pause();
          setIsPlaying(false);
        }
      } else {
        setIsTabUnfocused(false);
      }
    };

    const handleBlur = () => {
      setIsTabUnfocused(true);
      if (videoRef.current && !videoRef.current.paused) {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    };

    const handleFocus = () => {
      setIsTabUnfocused(false);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  // Periodic Progress Sync to Server
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      if (videoRef.current && duration > 0) {
        syncProgress(videoRef.current.currentTime, duration);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isPlaying, duration, videoId]);

  const syncProgress = async (pos: number, dur: number) => {
    try {
      const res = await fetch("/api/videos/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoId,
          lastPosition: pos,
          totalDuration: dur,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setWatchedPercent(data.videoProgress.watchedPercentage);
        if (data.videoProgress.isCompleted && !isCompleted) {
          setIsCompleted(true);
          if (onCompleted) onCompleted();
        }
      }
    } catch (e) {
      console.error("Progress sync failed", e);
    }
  };

  const handlePlayPause = () => {
    if (!hasAgreedConfidentiality) {
      setShowConfidentialModal(true);
      return;
    }

    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
      syncProgress(videoRef.current.currentTime, duration);
    } else {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((e) => console.log("Autoplay blocked", e));
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setIsMuted(val === 0);
    if (videoRef.current) {
      videoRef.current.volume = val;
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.volume = volume || 0.5;
      setIsMuted(false);
    } else {
      videoRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => console.log(err));
    } else {
      document.exitFullscreen().catch((err) => console.log(err));
    }
  };

  const changePlaybackSpeed = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  };

  const handleResumeClick = (position: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = position;
    }
    setResumePrompt(null);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  if (loading) {
    return (
      <div className="w-full aspect-video bg-slate-950 rounded-2xl flex flex-col items-center justify-center p-6 border border-slate-800 text-white">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-semibold text-sm tracking-wide text-slate-300">
          Generating Short-Lived Signed Playback Authorization...
        </p>
        <span className="text-xs text-slate-500 mt-1">
          Establishing encrypted stream session for SCPL Joiner
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full aspect-video bg-slate-950 rounded-2xl flex flex-col items-center justify-center p-6 border border-red-900/50 text-white text-center">
        <div className="w-12 h-12 bg-red-950/80 rounded-full flex items-center justify-center text-red-500 mb-3 border border-red-700">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h4 className="text-lg font-bold text-red-400 mb-1">Protected Stream Access Error</h4>
        <p className="text-sm text-slate-300 max-w-md">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-semibold flex items-center gap-2 border border-slate-700 transition"
        >
          <RotateCcw className="w-4 h-4" /> Try Refreshing Session
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Confidentiality Modal */}
      <ConfidentialModal
        isOpen={showConfidentialModal}
        videoTitle={videoTitle}
        onAgree={() => {
          setShowConfidentialModal(false);
          setHasAgreedConfidentiality(true);
        }}
      />

      {/* Main Video Container */}
      <div
        ref={containerRef}
        onContextMenu={(e) => e.preventDefault()}
        className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-slate-800 select-none group"
      >
        {/* Dynamic Watermark Overlay */}
        <WatermarkOverlay
          empName={empName}
          empId={empId}
          sessionId={sessionId}
          ipAddress={ipAddress}
        />

        {/* Focus Loss / Window Blur Security Pause Banner */}
        {isTabUnfocused && (
          <div className="absolute inset-0 z-40 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center text-center p-6 text-white animate-in fade-in">
            <div className="w-16 h-16 rounded-2xl bg-amber-950/80 border border-amber-600/50 flex items-center justify-center text-amber-400 mb-4 animate-bounce">
              <EyeOff className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-amber-300 mb-2">Training Video Paused</h3>
            <p className="text-sm text-slate-300 max-w-md leading-relaxed mb-4">
              Please return focus to this training window to resume watching. Video automatically pauses when window focus is changed.
            </p>
            <span className="text-xs px-3 py-1 bg-amber-900/40 rounded-full text-amber-300 border border-amber-800">
              🔒 Protected Learning Security Protocol
            </span>
          </div>
        )}

        {/* Resume Watch Banner Prompt */}
        {resumePrompt !== null && !isPlaying && (
          <div className="absolute top-4 left-4 right-4 z-40 bg-slate-900/90 backdrop-blur-md border border-red-500/50 rounded-xl p-3 text-white flex flex-wrap items-center justify-between gap-3 shadow-xl">
            <div className="flex items-center gap-2 text-xs md:text-sm">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              <span>
                Resume playback from <strong className="text-red-400">{formatTime(resumePrompt)}</strong>?
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleResumeClick(resumePrompt)}
                className="px-3 py-1 bg-red-600 hover:bg-red-500 rounded-lg text-xs font-bold text-white transition shadow"
              >
                CONTINUE
              </button>
              <button
                onClick={() => handleResumeClick(0)}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-semibold text-slate-300 transition border border-slate-700"
              >
                START OVER
              </button>
            </div>
          </div>
        )}

        {/* Video Element */}
        {streamUrl && (
          <video
            ref={videoRef}
            src={streamUrl}
            playsInline
            controlsList="nodownload noremoteplayback noplaybackrate"
            disablePictureInPicture
            onTimeUpdate={() => {
              if (videoRef.current) {
                setCurrentTime(videoRef.current.currentTime);
              }
            }}
            onLoadedMetadata={() => {
              if (videoRef.current) {
                setDuration(videoRef.current.duration);
              }
            }}
            onEnded={() => {
              setIsPlaying(false);
              if (videoRef.current) {
                syncProgress(videoRef.current.duration, videoRef.current.duration);
              }
            }}
            onClick={handlePlayPause}
            className="w-full h-full object-contain cursor-pointer"
          />
        )}

        {/* Custom Controls Bar */}
        <div className="absolute bottom-0 inset-x-0 z-30 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 transition-opacity duration-300 opacity-90 group-hover:opacity-100">
          {/* Progress Seek Bar */}
          <div className="relative w-full mb-3 flex items-center">
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 bg-slate-700/80 rounded-lg appearance-none cursor-pointer accent-red-600 hover:accent-red-500 transition-all"
            />
          </div>

          <div className="flex items-center justify-between text-white text-xs md:text-sm">
            {/* Left Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={handlePlayPause}
                className="w-9 h-9 rounded-xl bg-red-600 hover:bg-red-500 text-white flex items-center justify-center transition shadow-lg shrink-0"
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
              </button>

              <div className="flex items-center gap-2">
                <button onClick={toggleMute} className="text-slate-300 hover:text-white transition">
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 h-1 bg-slate-700 rounded appearance-none accent-slate-200 cursor-pointer hidden sm:block"
                />
              </div>

              <div className="text-xs text-slate-300 font-mono tracking-wider ml-1">
                <span>{formatTime(currentTime)}</span> / <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-3">
              {/* Playback Speed Selector */}
              <div className="relative group/speed flex items-center gap-1 text-xs text-slate-300 bg-slate-900/80 border border-slate-700 px-2 py-1 rounded-lg">
                <FastForward className="w-3.5 h-3.5 text-red-400" />
                <select
                  value={playbackRate}
                  onChange={(e) => changePlaybackSpeed(parseFloat(e.target.value))}
                  className="bg-transparent text-white border-none outline-none cursor-pointer text-xs font-semibold"
                >
                  <option value="1" className="bg-slate-900">1.0x Normal</option>
                  <option value="1.25" className="bg-slate-900">1.25x Speed</option>
                  <option value="1.5" className="bg-slate-900">1.5x Speed</option>
                </select>
              </div>

              {/* Fullscreen Button */}
              <button onClick={toggleFullscreen} className="text-slate-300 hover:text-white transition">
                <Maximize className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Video Progress & Security Status Bar Below Player */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between text-xs text-slate-300 gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <Lock className="w-3.5 h-3.5" />
            <span>Encrypted Stream Session</span>
          </div>
          <span className="text-slate-700">|</span>
          <div>
            Watched: <strong className="text-white">{watchedPercent}%</strong> / 90% required
          </div>
        </div>

        {isCompleted ? (
          <div className="flex items-center gap-1 text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-full">
            <CheckCircle2 className="w-4 h-4" /> Lesson Completed ✓
          </div>
        ) : (
          <span className="text-amber-400 text-[11px] bg-amber-950/40 border border-amber-800/40 px-2.5 py-1 rounded-full">
            Watch at least 90% to mark completed
          </span>
        )}
      </div>
    </div>
  );
}
