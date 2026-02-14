import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { fetchGastronogeekVideos } from "./services/youtubeService";
import { getDb } from "./db";
import { videos as videosTable } from "../drizzle/schema";
import { desc, like, eq } from "drizzle-orm";

/**
 * Content management router - handles video fetching and syncing
 */
export const contentRouter = router({
  /**
   * Fetch videos from Gastronogeek's YouTube channel
   * This is an admin-only operation
   */
  syncYouTubeVideos: protectedProcedure
    .input(
      z.object({
        maxResults: z.number().default(50),
        pageToken: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Check if user is admin (optional - for now allow all authenticated users)
        // In production, add: if (ctx.user.role !== "admin") throw new Error("Unauthorized");

        const { maxResults, pageToken } = input;
        const limit = Math.min(maxResults, 250);

        console.log(
          `Fetching YouTube videos (max: ${limit}, pageToken: ${pageToken})`
        );

        // Fetch videos from YouTube
        const { videos, nextPageToken } = await fetchGastronogeekVideos(
          limit,
          pageToken
        );

        if (videos.length === 0) {
          return {
            success: true,
            message: "No new videos found",
            videosProcessed: 0,
            nextPageToken: null,
          };
        }

        // Get database connection
        const db = await getDb();
        if (!db) {
          throw new Error("Database not available");
        }

        // Store videos in database
        let videosProcessed = 0;
        for (const video of videos) {
          try {
            // Check if video already exists
            // Check if video already exists
            const existing = await db
              .select()
              .from(videosTable)
              .where(eq(videosTable.videoId, video.videoId))
              .limit(1);

            if (existing.length === 0) {
              // Insert new video
              await db.insert(videosTable).values({
                videoId: video.videoId,
                platform: video.platform,
                title: video.title,
                description: video.description,
                url: video.url,
                thumbnailUrl: video.thumbnailUrl,
                publishedAt: video.publishedAt,
                duration: video.duration,
                viewCount: video.viewCount,
                transcript: null,
                embedding: null,
              });

              videosProcessed++;
              console.log(`Stored video: ${video.title}`);
            }
          } catch (error) {
            console.error(`Error storing video ${video.videoId}:`, error);
          }
        }

        return {
          success: true,
          message: `Successfully processed ${videosProcessed} new videos`,
          videosProcessed,
          nextPageToken,
          totalFetched: videos.length,
        };
      } catch (error) {
        console.error("Error syncing YouTube videos:", error);
        throw new Error(`Failed to sync videos: ${error}`);
      }
    }),

  /**
   * Get all stored videos
   */
  getStoredVideos: publicProcedure
    .input(
      z.object({
        limit: z.number().default(20),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      try {
        const { limit, offset } = input;
        const db = await getDb();

        if (!db) {
          throw new Error("Database not available");
        }

        const storedVideos = await db
          .select()
          .from(videosTable)
          .orderBy(desc(videosTable.publishedAt))
          .limit(Math.min(limit, 100))
          .offset(offset);

        return {
          videos: storedVideos,
          total: storedVideos.length,
        };
      } catch (error) {
        console.error("Error fetching stored videos:", error);
        throw new Error("Failed to fetch videos");
      }
    }),

  /**
   * Get video count
   */
  getVideoCount: publicProcedure.query(async () => {
    try {
      const db = await getDb();

      if (!db) {
        return { count: 0 };
      }

      const result = await db.select().from(videosTable);

      return {
        count: result.length,
      };
    } catch (error) {
      console.error("Error getting video count:", error);
      return { count: 0 };
    }
  }),

  /**
   * Search videos by title or description
   */
  searchVideos: publicProcedure
    .input(
      z.object({
        query: z.string().min(1),
        limit: z.number().default(10),
      })
    )
    .query(async ({ input }) => {
      try {
        const { query, limit } = input;
        const db = await getDb();

        if (!db) {
          throw new Error("Database not available");
        }

        // Simple text search using LIKE
        const results = await db
          .select()
          .from(videosTable)
          .where(like(videosTable.title, `%${query}%`))
          .limit(Math.min(limit, 50));

        return {
          videos: results,
          total: results.length,
        };
      } catch (error) {
        console.error("Error searching videos:", error);
        throw new Error("Failed to search videos");
      }
    }),
});

export type ContentRouter = typeof contentRouter;
