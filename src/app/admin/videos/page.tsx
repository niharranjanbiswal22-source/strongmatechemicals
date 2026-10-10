"use client";

import React, { useEffect, useState } from "react";
import { Video, Plus, Lock, Play, Upload } from "lucide-react";
import { formatDuration } from "@/lib/utils";

interface VideoItem {
  id: string;
  title: string;
  description?: string;
  videoUrl: string;
  duration: number;
  completionThreshold: number;
  status: string;
  createdAt: string;
  module?: {
    title: string;
    course?: {
      title: string;
    };
  };
  _count?: {
    videoProgress: number;
  };
}

interface CourseItem {
  id: string;
  title: string;
  modules?: {
    id: string;
    title: string;
  }[];
}

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [duration, setDuration] = useState(300);
  const [completionThreshold, setCompletionThreshold] = useState(90);
  const [courseId, setCourseId] = useState("");
  const [moduleId, setModuleId] = useState("");
  const [newModuleName, setNewModuleName] = useState("");

  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/videos");
      const data = await res.json();
      if (data.videos) setVideos(data.videos);
      if (data.courses) {
        setCourses(data.courses);
        if (data.courses.length > 0) {
          setCourseId(data.courses[0].id);
          if (data.courses[0].modules && data.courses[0].modules.length > 0) {
            setModuleId(data.courses[0].modules[0].id);
          }
        }
      }
    } catch (e: any) {
      console.error(e);
      setError("Failed to load video list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const uploadVideoChunked = async (
    file: File,
    cloudName: string,
    uploadPreset: string,
    onProgress: (percent: number) => void
  ): Promise<{ secure_url: string; duration?: number }> => {
    // If file is smaller than 6MB, send in one request
    if (file.size <= 6 * 1024 * 1024) {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", uploadPreset);

        xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`, true);

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            onProgress(Math.round((e.loaded / e.total) * 100));
          }
        };

        xhr.onload = () => {
          try {
            const data = JSON.parse(xhr.responseText);
            if (xhr.status >= 200 && xhr.status < 300 && data.secure_url) {
              resolve({
                secure_url: data.secure_url,
                duration: data.duration ? Math.round(data.duration) : 300,
              });
            } else {
              reject(new Error(data.error?.message || `Cloudinary returned status ${xhr.status}`));
            }
          } catch (err) {
            reject(new Error("Upload failed. Try using Cloudinary Popup Studio."));
          }
        };

        xhr.onerror = () => reject(new Error("Network error during video upload."));
        xhr.send(formData);
      });
    }

    // For files > 6MB: Send in 5MB Chunks to prevent Cloudinary unsigned size limits
    const chunkSize = 5 * 1024 * 1024;
    const totalChunks = Math.ceil(file.size / chunkSize);
    const uniqueUploadId = `cld_upload_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    let finalSecureUrl = "";
    let finalDuration = 300;

    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, end);

      const formData = new FormData();
      formData.append("file", chunk);
      formData.append("upload_preset", uploadPreset);

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`, true);
        xhr.setRequestHeader("Content-Range", `bytes ${start}-${end - 1}/${file.size}`);
        xhr.setRequestHeader("X-Unique-Upload-Id", uniqueUploadId);

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const chunkProgress = e.loaded / e.total;
            const overallPercent = Math.round(((i + chunkProgress) / totalChunks) * 100);
            onProgress(overallPercent);
          }
        };

        xhr.onload = () => {
          try {
            const data = JSON.parse(xhr.responseText);
            if (xhr.status >= 200 && xhr.status < 300) {
              if (data.secure_url) {
                finalSecureUrl = data.secure_url;
                if (data.duration) finalDuration = Math.round(data.duration);
              }
              resolve();
            } else {
              reject(new Error(data.error?.message || `Chunk ${i + 1} upload failed (${xhr.status})`));
            }
          } catch (err) {
            reject(new Error(`Failed to process chunk ${i + 1} response`));
          }
        };

        xhr.onerror = () => reject(new Error("Network connection drop during video chunk upload."));
        xhr.send(formData);
      });

      onProgress(Math.round(((i + 1) / totalChunks) * 100));
    }

    if (!finalSecureUrl) {
      throw new Error("Video upload completed but URL missing. Please try again.");
    }

    return { secure_url: finalSecureUrl, duration: finalDuration };
  };

  const openCloudinaryWidget = () => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "y2m5kubk";
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "strongmate_videos";

    const launchWidget = () => {
      if (typeof window !== "undefined" && (window as any).cloudinary) {
        const widget = (window as any).cloudinary.createUploadWidget(
          {
            cloudName,
            uploadPreset,
            resourceType: "video",
            sources: ["local", "url", "camera"],
            multiple: false,
          },
          (error: any, result: any) => {
            if (!error && result && result.event === "success") {
              setVideoUrl(result.info.secure_url);
              if (result.info.duration) {
                setDuration(Math.round(result.info.duration));
              }
              if (!title && result.info.original_filename) {
                setTitle(result.info.original_filename.replace(/_/g, " "));
              }
            }
          }
        );
        widget.open();
      }
    };

    if (typeof window !== "undefined" && !(window as any).cloudinary) {
      const script = document.createElement("script");
      script.src = "https://upload-widget.cloudinary.com/global/all.js";
      script.onload = launchWidget;
      document.body.appendChild(script);
    } else {
      launchWidget();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    setUploadProgress(0);
    setError(null);

    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "y2m5kubk";
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "strongmate_videos";

      const data = await uploadVideoChunked(file, cloudName, uploadPreset, (percent) => {
        setUploadProgress(percent);
      });

      setVideoUrl(data.secure_url);
      if (data.duration) {
        setDuration(Math.round(data.duration));
      }
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
    } catch (err: any) {
      console.error("Video upload error:", err);
      setError(err.message || "Upload failed. Try using Cloudinary Upload Studio widget below.");
    } finally {
      setUploadingFile(false);
    }
  };

  const handleUploadVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          videoUrl,
          duration,
          completionThreshold,
          courseId,
          moduleId,
          newModuleName,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to upload video");
      }

      setShowModal(false);
      setTitle("");
      setDescription("");
      setVideoUrl("");
      fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const selectedCourseObj = courses.find((c) => c.id === courseId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
            <Video className="w-7 h-7 text-red-500" /> Training Videos & DRM Management
          </h1>
          <p className="text-xs text-slate-400">
            Admin portal to upload local video files or stream links for SCPL joiners.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-red-950/40"
        >
          <Plus className="w-4 h-4" /> Upload New Training Video
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400">
          <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          Loading training videos list...
        </div>
      ) : (
        /* Videos List Table */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-4">Video Title</th>
                  <th className="p-4">Course & Module</th>
                  <th className="p-4">Duration</th>
                  <th className="p-4">Req threshold</th>
                  <th className="p-4">Learner Views</th>
                  <th className="p-4">Security Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {videos.length > 0 ? (
                  videos.map((vid) => (
                    <tr key={vid.id} className="hover:bg-slate-800/50 transition">
                      <td className="p-4 font-bold text-white flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-red-950 text-red-400 flex items-center justify-center shrink-0 border border-red-800">
                          <Play className="w-3.5 h-3.5 fill-current" />
                        </div>
                        <span>{vid.title}</span>
                      </td>
                      <td className="p-4 text-slate-300">
                        <div className="font-semibold text-white">
                          {vid.module?.course?.title || "SCPL Course"}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {vid.module?.title || "General Module"}
                        </div>
                      </td>
                      <td className="p-4 font-mono">{formatDuration(vid.duration || 300)}</td>
                      <td className="p-4 font-mono font-bold text-amber-400">
                        {vid.completionThreshold || 90}%
                      </td>
                      <td className="p-4 font-mono text-emerald-400">
                        {vid._count?.videoProgress || 0} Viewers
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] font-bold border border-emerald-800 flex items-center gap-1 w-fit">
                          <Lock className="w-3 h-3" /> Signed Token DRM
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      No videos uploaded yet. Click &quot;Upload New Training Video&quot; above to publish your first video.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Upload Video Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-white">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Video className="w-5 h-5 text-red-500" /> Admin Upload Training Video
            </h3>

            {error && (
              <div className="p-3 bg-red-950 border border-red-800 rounded-xl text-xs text-red-300">
                {error}
              </div>
            )}

            <form onSubmit={handleUploadVideo} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Video Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Qlumate White Guard Application SOP"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              {/* Local File Selector */}
              <div className="bg-slate-950 border border-slate-800 p-3 rounded-2xl space-y-1.5">
                <label className="block font-bold text-slate-200 flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-red-500" /> Choose Video File from Laptop/Computer:
                </label>
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/ogg,video/quicktime"
                  onChange={handleFileChange}
                  disabled={uploadingFile}
                  className="w-full text-xs text-slate-300 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-red-600 file:text-white hover:file:bg-red-500 cursor-pointer"
                />
                {uploadingFile && (
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-[11px] text-amber-400 font-semibold">
                      <span>⏳ Uploading video to Cloudinary CDN...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                      <div
                        className="bg-gradient-to-r from-red-600 via-amber-500 to-emerald-400 h-full transition-all duration-300 rounded-full"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-800/80 mt-2">
                  <p className="text-[11px] text-slate-400 mb-1.5 font-medium">Or use official Cloudinary Upload Widget:</p>
                  <button
                    type="button"
                    onClick={openCloudinaryWidget}
                    className="w-full py-2.5 px-3 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-slate-100 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow"
                  >
                    ☁️ Open Cloudinary Upload Studio (Popup Widget)
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Video Link / URL (Auto-filled on upload or paste URL) *</label>
                <input
                  type="text"
                  required
                  placeholder="https://.../video.mp4 or /uploads/video.mp4"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Target Course *</label>
                  <select
                    value={courseId}
                    onChange={(e) => {
                      setCourseId(e.target.value);
                      const selected = courses.find((c) => c.id === e.target.value);
                      if (selected && selected.modules && selected.modules.length > 0) {
                        setModuleId(selected.modules[0].id);
                      } else {
                        setModuleId("");
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Module Selection</label>
                  <select
                    value={moduleId}
                    onChange={(e) => setModuleId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  >
                    {selectedCourseObj?.modules?.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.title}
                      </option>
                    ))}
                    <option value="">+ Create New Module Name</option>
                  </select>
                </div>
              </div>

              {!moduleId && (
                <div>
                  <label className="block font-bold text-slate-300 mb-1">New Module Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Module 4: Cool Roof Application"
                    value={newModuleName}
                    onChange={(e) => setNewModuleName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Duration (Seconds)</label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Completion Threshold %</label>
                  <input
                    type="number"
                    value={completionThreshold}
                    onChange={(e) => setCompletionThreshold(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Lesson Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Overview of lesson procedure and technical steps..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploadingFile}
                  className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold shadow disabled:opacity-50"
                >
                  {saving ? "Publishing..." : "Publish Training Video"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
