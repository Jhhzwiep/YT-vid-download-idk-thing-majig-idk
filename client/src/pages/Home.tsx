import { useState } from "react";
import UrlInput from "@/components/UrlInput";
import VideoPreview from "@/components/VideoPreview";
import DownloadProgress from "@/components/DownloadProgress";
import Toast from "@/components/Toast";
import useYoutubeDownloader from "@/hooks/useYoutubeDownloader";
import type { YoutubeVideo, VideoFormat, DownloadProgress as ProgressType } from "@shared/schema";

export default function Home() {
  const [selectedQuality, setSelectedQuality] = useState<string>("720p");
  const {
    videoInfo,
    isLoading,
    fetchVideoInfo,
    downloadVideo,
    downloadProgress,
    isDownloading,
    cancelDownload,
    error,
    showToast,
    toastMessage,
    toastType,
    dismissToast,
  } = useYoutubeDownloader();

  const handleUrlSubmit = async (url: string) => {
    await fetchVideoInfo(url);
  };

  const handleQualityChange = (quality: string) => {
    setSelectedQuality(quality);
  };

  const handleDownload = () => {
    if (!videoInfo) return;
    
    const selectedFormat = videoInfo.formats.find(
      format => format.qualityLabel === selectedQuality
    );
    
    if (selectedFormat) {
      downloadVideo(videoInfo.videoId, selectedFormat.itag);
    } else {
      // If exact quality not found, fallback to highest available
      const highestFormat = videoInfo.formats[0];
      downloadVideo(videoInfo.videoId, highestFormat.itag);
    }
  };

  return (
    <div className="font-sans text-gray-800 min-h-screen bg-[#F3F4F6]">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">YouTube Video Downloader</h1>
          <p className="text-gray-600">Download your favorite YouTube videos in different qualities</p>
        </header>

        <UrlInput onSubmit={handleUrlSubmit} isLoading={isLoading} />

        {videoInfo && !isDownloading && (
          <VideoPreview
            videoInfo={videoInfo}
            selectedQuality={selectedQuality}
            onQualityChange={handleQualityChange}
            onDownload={handleDownload}
          />
        )}

        {isDownloading && downloadProgress && (
          <DownloadProgress 
            progress={downloadProgress} 
            onCancel={cancelDownload} 
          />
        )}

        <Toast
          message={toastMessage}
          type={toastType}
          isVisible={showToast}
          onDismiss={dismissToast}
        />
        
        <footer className="text-center text-gray-500 text-sm mt-8">
          <p>This tool is for personal use only. Please respect copyright laws.</p>
        </footer>
      </div>
    </div>
  );
}
