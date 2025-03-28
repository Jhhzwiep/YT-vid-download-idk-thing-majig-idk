import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { YoutubeVideo, DownloadProgress } from "@shared/schema";

export default function useYoutubeDownloader() {
  const [videoInfo, setVideoInfo] = useState<YoutubeVideo | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [downloadAbortController, setDownloadAbortController] = useState<AbortController | null>(null);

  const fetchVideoMutation = useMutation({
    mutationFn: async (url: string) => {
      const response = await apiRequest("POST", "/api/youtube/info", { url });
      return await response.json() as YoutubeVideo;
    },
    onSuccess: (data) => {
      setVideoInfo(data);
    },
    onError: (error) => {
      displayToast("Failed to fetch video information: " + error.message, "error");
    }
  });

  const fetchVideoInfo = async (url: string) => {
    await fetchVideoMutation.mutateAsync(url);
  };

  const downloadVideo = async (videoId: string, itag: number) => {
    try {
      setIsDownloading(true);
      displayToast("Starting download...", "success");
      
      // For the redirect-based approach, we'll open the download URL in a new tab
      const downloadUrl = `/api/youtube/download?videoId=${videoId}&itag=${itag}`;
      
      // Simulate progress since we can't track actual progress with redirects
      simulateDownloadProgress();
      
      // Open the download URL in a new window/tab
      window.open(downloadUrl, '_blank');
      
      // After a few seconds, assume the download has started and reset the downloading state
      setTimeout(() => {
        setIsDownloading(false);
        setDownloadProgress(null);
        displayToast("Download initiated. Check your browser's download bar for progress.", "success");
      }, 3000);
      
    } catch (error: any) {
      displayToast(`Download failed: ${error.message}`, "error");
      setIsDownloading(false);
    }
  };
  
  // Function to simulate download progress for a better UX
  const simulateDownloadProgress = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      if (progress >= 100) {
        clearInterval(interval);
        return;
      }
      
      setDownloadProgress({
        percentage: progress,
        speed: "Preparing download...",
        size: "Calculating...",
        eta: "Initiating download..."
      });
    }, 100);
    
    // Clear the interval after 3 seconds
    setTimeout(() => {
      clearInterval(interval);
    }, 3000);
  };

  const cancelDownload = () => {
    if (downloadAbortController) {
      downloadAbortController.abort();
      setDownloadAbortController(null);
    }
    setIsDownloading(false);
  };

  const displayToast = (message: string, type: "success" | "error") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  const dismissToast = () => {
    setShowToast(false);
  };

  return {
    videoInfo,
    isLoading: fetchVideoMutation.isPending,
    fetchVideoInfo,
    downloadVideo,
    downloadProgress,
    isDownloading,
    cancelDownload,
    error: fetchVideoMutation.error,
    showToast,
    toastMessage,
    toastType,
    dismissToast
  };
}
