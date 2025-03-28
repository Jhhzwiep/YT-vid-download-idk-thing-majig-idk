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
      
      // Create an AbortController to allow canceling the download
      const abortController = new AbortController();
      setDownloadAbortController(abortController);
      
      // Start the download
      const response = await fetch(`/api/youtube/download?videoId=${videoId}&itag=${itag}`, {
        signal: abortController.signal
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Get filename from headers
      const contentDisposition = response.headers.get('content-disposition');
      let filename = 'video.mp4';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Stream and monitor download progress
      const reader = response.body?.getReader();
      const contentLength = Number(response.headers.get('content-length')) || 0;
      
      if (!reader) {
        throw new Error("Unable to read response body");
      }
      
      // Create a new ReadableStream to consume the response
      const stream = new ReadableStream({
        async start(controller) {
          let receivedLength = 0;
          let startTime = Date.now();
          let lastUpdateTime = startTime;
          let chunks: Uint8Array[] = [];
          
          try {
            while (true) {
              const { done, value } = await reader.read();
              
              if (done) {
                controller.close();
                break;
              }
              
              receivedLength += value.length;
              chunks.push(value);
              controller.enqueue(value);
              
              // Update progress information approximately every 500ms
              const now = Date.now();
              if (now - lastUpdateTime > 500) {
                const elapsedSeconds = (now - startTime) / 1000;
                const bytesPerSecond = receivedLength / elapsedSeconds;
                const percentComplete = Math.round((receivedLength / contentLength) * 100);
                
                // Calculate ETA
                const remainingBytes = contentLength - receivedLength;
                const etaSeconds = bytesPerSecond > 0 ? Math.round(remainingBytes / bytesPerSecond) : 0;
                let etaText = '';
                
                if (etaSeconds > 60) {
                  const minutes = Math.floor(etaSeconds / 60);
                  const seconds = etaSeconds % 60;
                  etaText = `~${minutes} minute${minutes !== 1 ? 's' : ''} ${seconds} second${seconds !== 1 ? 's' : ''} remaining`;
                } else {
                  etaText = `~${etaSeconds} second${etaSeconds !== 1 ? 's' : ''} remaining`;
                }
                
                // Format speed
                const mbps = bytesPerSecond / (1024 * 1024);
                const speedText = `${mbps.toFixed(1)} MB/s`;
                
                // Format size
                const downloadedMB = receivedLength / (1024 * 1024);
                const totalMB = contentLength / (1024 * 1024);
                const sizeText = `${downloadedMB.toFixed(1)} MB / ${totalMB.toFixed(1)} MB`;
                
                setDownloadProgress({
                  percentage: percentComplete,
                  speed: speedText,
                  size: sizeText,
                  eta: etaText
                });
                
                lastUpdateTime = now;
              }
            }
            
            // Create blob from all chunks
            const blob = new Blob(chunks);
            
            // Create download link
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            
            // Cleanup
            URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            setIsDownloading(false);
            displayToast("Video downloaded successfully!", "success");
          } 
          catch (error: any) {
            if (error.name === 'AbortError') {
              displayToast("Download cancelled", "error");
            } else {
              displayToast(`Download failed: ${error.message}`, "error");
            }
            setIsDownloading(false);
            controller.error(error);
          }
        }
      });
      
      // Create a Response from the stream
      const newResponse = new Response(stream);
      
      // Start consuming the stream to trigger the download
      await newResponse.blob();
      
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        displayToast(`Download failed: ${error.message}`, "error");
        setIsDownloading(false);
      }
    }
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
