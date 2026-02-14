import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { chatMessages, chatSessions, videos, recipes, ChatMessage } from "../drizzle/schema";
import { eq, desc, or, like } from "drizzle-orm";
import { generateStrictContextResponse } from "./services/mistralService";

// Schema for chat input
const chatInputSchema = z.object({
  message: z.string().min(1, "Message cannot be empty"),
  sessionId: z.number().optional(),
});

// Schema for creating a new session
const createSessionSchema = z.object({
  title: z.string().optional(),
});

/**
 * Chatbot router - handles all chat-related operations
 */
export const chatbotRouter = router({
  /**
   * Send a message and get a response from the chatbot
   */
  sendMessage: protectedProcedure
    .input(chatInputSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const { message, sessionId } = input;
        const userId = ctx.user.id;

        // Get database connection
        const db = await getDb();
        
        // Search for relevant videos based on the user's message
        let sourceVideos: any[] = [];
        let videoContext = "";
        
        if (db) {
          // Extract keywords from the user's message
          const keywords = message.toLowerCase().split(/\s+/).filter(w => w.length > 2);
          
          // Search for videos matching any of the keywords
          let searchResults: any[] = [];
          
          if (keywords.length > 0) {
            // Build search conditions for each keyword
            const searchConditions = keywords.flatMap(keyword => [
              like(videos.title, `%${keyword}%`),
              like(videos.description, `%${keyword}%`),
            ]);
            
            // Search for videos matching any keyword
            searchResults = await db
              .select()
              .from(videos)
              .where(or(...searchConditions))
              .orderBy(desc(videos.publishedAt))
              .limit(5);
          }
          
          // If no search results, get the most recent videos
          if (searchResults.length === 0) {
            searchResults = await db
              .select()
              .from(videos)
              .orderBy(desc(videos.publishedAt))
              .limit(5);
          }
          
          sourceVideos = searchResults.map(v => ({
            id: v.id,
            title: v.title,
            description: v.description,
            thumbnailUrl: v.thumbnailUrl,
            videoUrl: v.url,
            duration: v.duration,
            viewCount: v.viewCount,
          }));
          
          // Build context from videos for the LLM
          videoContext = sourceVideos
            .map(v => `Titre: ${v.title}\nDescription: ${v.description || 'N/A'}\nURL: ${v.videoUrl}`)
            .join("\n\n");
        }

        // Generate response using strict context-only mode (temperature 0)
        const { response: botResponse, hasContext } = await generateStrictContextResponse(
          message,
          videoContext
        );

        // Save the chat message to the database
        if (db) {
          await db.insert(chatMessages).values({
            userId,
            userMessage: message,
            botResponse,
            sourceVideos: JSON.stringify(hasContext ? sourceVideos : []),
            sourceRecipes: JSON.stringify([]),
          });
        }

        return {
          userMessage: message,
          botResponse,
          sourceVideos: hasContext ? sourceVideos : [],
          sourceRecipes: [],
          timestamp: new Date(),
        };
      } catch (error) {
        console.error("Error in sendMessage:", error);
        const errorMessage = error instanceof Error ? error.message : "Erreur lors du traitement de votre message";
        throw new Error(errorMessage);
      }
    }),

  /**
   * Get chat history for a session
   */
  getChatHistory: protectedProcedure
    .input(z.object({ sessionId: z.number().optional() }))
    .query(async ({ input, ctx }) => {
      try {
        const userId = ctx.user.id;
        const db = await getDb();
        if (!db) {
          throw new Error("Database not available");
        }

        const messages = await db
          .select()
          .from(chatMessages)
          .where(eq(chatMessages.userId, userId))
          .orderBy(desc(chatMessages.createdAt))
          .limit(50);

        return messages.map((msg: ChatMessage) => ({
          id: msg.id,
          userMessage: msg.userMessage,
          botResponse: msg.botResponse,
          sourceVideos: msg.sourceVideos ? JSON.parse(msg.sourceVideos) : [],
          sourceRecipes: msg.sourceRecipes
            ? JSON.parse(msg.sourceRecipes)
            : [],
          createdAt: msg.createdAt,
        }));
      } catch (error) {
        console.error("Error in getChatHistory:", error);
        throw new Error("Failed to retrieve chat history");
      }
    }),

  /**
   * Create a new chat session
   */
  createSession: protectedProcedure
    .input(createSessionSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const userId = ctx.user.id;
        const title = input.title || `Chat ${new Date().toLocaleDateString()}`;
        const db = await getDb();
        if (!db) {
          throw new Error("Database not available");
        }

        await db.insert(chatSessions).values({
          userId,
          title,
        });

        return {
          success: true,
          message: "Session created successfully",
        };
      } catch (error) {
        console.error("Error in createSession:", error);
        throw new Error("Failed to create session");
      }
    }),

  /**
   * Get all chat sessions for the user
   */
  getSessions: protectedProcedure.query(async ({ ctx }) => {
    try {
      const userId = ctx.user.id;
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      const sessions = await db
        .select()
        .from(chatSessions)
        .where(eq(chatSessions.userId, userId))
        .orderBy(desc(chatSessions.createdAt));

      return sessions;
    } catch (error) {
      console.error("Error in getSessions:", error);
      throw new Error("Failed to retrieve sessions");
    }
  }),

  /**
   * Get available videos (for future RAG implementation)
   */
  getVideos: publicProcedure
    .input(
      z.object({
        limit: z.number().default(10),
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

        const videoList = await db
          .select()
          .from(videos)
          .orderBy(desc(videos.createdAt))
          .limit(limit)
          .offset(offset);

        return videoList;
      } catch (error) {
        console.error("Error in getVideos:", error);
        throw new Error("Failed to retrieve videos");
      }
    }),

  /**
   * Get recipes (for future RAG implementation)
   */
  getRecipes: publicProcedure
    .input(
      z.object({
        limit: z.number().default(10),
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

        const recipeList = await db
          .select()
          .from(recipes)
          .orderBy(desc(recipes.createdAt))
          .limit(limit)
          .offset(offset);

        return recipeList;
      } catch (error) {
        console.error("Error in getRecipes:", error);
        throw new Error("Failed to retrieve recipes");
      }
    }),
});

export type ChatbotRouter = typeof chatbotRouter;

// TODO: add feature queries here as your schema grows.
