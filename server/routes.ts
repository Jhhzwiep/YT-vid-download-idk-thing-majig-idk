import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import ytdl from "ytdl-core";
import { z } from "zod";
import { youtubeVideo } from "@shared/schema";

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
      
      // Get video info with increased timeout and requestOptions
      const info = await ytdl.getInfo(videoId, {
        requestOptions: {
          headers: {
            // Add a user agent to avoid being blocked
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          }
        }
      });
      
      // Extract formats with both audio and video (typically MP4)
      const formats = info.formats
        .filter(format => format.hasAudio && format.hasVideo)
        .map(format => ({
          quality: format.quality || "unknown",
          itag: format.itag,
          container: format.container || "mp4",
          qualityLabel: format.qualityLabel || undefined,
          // Add estimated size if available (contentLength is in bytes)
          size: format.contentLength ? parseInt(format.contentLength) : undefined
        }));
      
      // Sort formats by resolution (high to low)
      formats.sort((a, b) => {
        const aRes = parseInt(a.qualityLabel?.replace('p', '') || '0');
        const bRes = parseInt(b.qualityLabel?.replace('p', '') || '0');
        return bRes - aRes;
      });
      
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
        formats
      };
      
      // Validate against our schema
      const validatedInfo = youtubeVideo.parse(videoInfo);
      
      res.json(validatedInfo);
    } catch (error: any) {
      console.error("Error fetching video info:", error);
      res.status(500).json({ message: error.message || "Failed to fetch video information" });
    }
  });

  // YouTube video download endpoint
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
      
      // Set headers
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', 'video/mp4');
      
      // Get the video stream with more specific options
      const videoStream = ytdl(videoId, {
        quality: itag,
        requestOptions: {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          }
        }
      });
      
      // Handle stream errors
      videoStream.on('error', (err) => {
        console.error("Stream error:", err);
        if (!res.headersSent) {
          res.status(500).json({ message: "Error streaming video" });
        }
      });
      
      // Pipe the video stream to the response
      videoStream.pipe(res);
      
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
