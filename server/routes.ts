import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import ytdl from "ytdl-core";
import { z } from "zod";
import { youtubeVideo } from "@shared/schema";
import https from 'https';

export async function registerRoutes(app: Express): Promise<Server> {
  // YouTube video info endpoint
  app.post("/api/youtube/info", async (req, res) => {
    try {
      // Validate request body
      const urlSchema = z.object({
        url: z.string().url()
      });
      
      const validationResult = urlSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid URL provided" });
      }
      
      const { url } = validationResult.data;
      
      // Check if it's a valid YouTube URL
      if (!ytdl.validateURL(url)) {
        return res.status(400).json({ message: "Not a valid YouTube URL" });
      }
      
      // Get video ID
      const videoId = ytdl.getVideoID(url);
      
      // Use getBasicInfo which is less likely to encounter signature issues
      const info = await ytdl.getBasicInfo(videoId, {
        requestOptions: {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          }
        }
      });
      
      // Create predefined formats for common resolutions since we can't reliably extract them
      const predefinedFormats = [
        { quality: "highest", itag: 18, container: "mp4", qualityLabel: "360p", size: undefined },
        { quality: "medium", itag: 22, container: "mp4", qualityLabel: "720p", size: undefined },
        { quality: "low", itag: 36, container: "mp4", qualityLabel: "144p", size: undefined }
      ];
      
      // Format duration
      const lengthSeconds = parseInt(info.videoDetails.lengthSeconds);
      const minutes = Math.floor(lengthSeconds / 60);
      const seconds = lengthSeconds % 60;
      const formattedDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      
      // Create the video info object
      const videoInfo = {
        videoId,
        title: info.videoDetails.title,
        thumbnail: info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1].url,
        duration: formattedDuration,
        formats: predefinedFormats
      };
      
      // Validate against our schema
      const validatedInfo = youtubeVideo.parse(videoInfo);
      
      res.json(validatedInfo);
    } catch (error: any) {
      console.error("Error fetching video info:", error);
      res.status(500).json({ message: error.message || "Failed to fetch video information" });
    }
  });

  // YouTube video download endpoint - redirects to YouTube's direct stream instead
  app.get("/api/youtube/download", async (req, res) => {
    try {
      // Validate query parameters
      const querySchema = z.object({
        videoId: z.string(),
        itag: z.string().transform(val => parseInt(val))
      });
      
      const validationResult = querySchema.safeParse(req.query);
      
      if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid parameters" });
      }
      
      const { videoId, itag } = validationResult.data;
      
      // Get video info for title (for filename)
      const info = await ytdl.getBasicInfo(videoId, {
        requestOptions: {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          }
        }
      });
      
      // Create a sanitized filename
      let filename = info.videoDetails.title
        .replace(/[^\w\s-]/g, '')  // Remove non-word chars except spaces and dashes
        .replace(/\s+/g, '_')      // Replace spaces with underscores
        .substring(0, 100);        // Limit length
      
      filename = `${filename}.mp4`;
      
      // Find a URL for the requested format
      const format = info.formats.find(f => f.itag === itag) || info.formats.find(f => f.hasVideo && f.hasAudio);
      
      if (!format || !format.url) {
        return res.status(404).json({ message: "Video format not found" });
      }
      
      // Redirect to the direct URL from YouTube
      res.redirect(format.url);
      
    } catch (error: any) {
      console.error("Error downloading video:", error);
      if (!res.headersSent) {
        res.status(500).json({ message: error.message || "Failed to download video" });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
