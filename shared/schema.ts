import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model remains the same as it might be needed for other parts of the app
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Define schema for YouTube video information
export const youtubeVideo = z.object({
  videoId: z.string(),
  title: z.string(),
  thumbnail: z.string(),
  duration: z.string(),
  formats: z.array(
    z.object({
      quality: z.string(),
      itag: z.number(),
      container: z.string(),
      qualityLabel: z.string().optional(),
      size: z.number().optional(),
    })
  ),
});

// Define schema for download progress
export const downloadProgress = z.object({
  percentage: z.number(),
  speed: z.string(),
  size: z.string(),
  eta: z.string(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type YoutubeVideo = z.infer<typeof youtubeVideo>;
export type DownloadProgress = z.infer<typeof downloadProgress>;
export type VideoFormat = YoutubeVideo["formats"][number];
