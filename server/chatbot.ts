import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { chatMessages, chatSessions, videos, recipes, ChatMessage } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";

import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

        // For now, generate a simple response using OpenAI
        // In production, this would use RAG to retrieve relevant videos
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content:
                "You are a helpful cooking assistant based on Gastronogeek's recipes and cooking videos. Help users with cooking questions, recipes, and techniques.",
            },
            {
              role: "user",
              content: message,
            },
          ],
          max_tokens: 500,
        });

        const botResponse =
          completion.choices[0]?.message?.content ||
          "I couldn't generate a response. Please try again.";

        // Save the chat message to the database
        const db = await getDb();
        if (db) {
          await db.insert(chatMessages).values({
            userId,
            userMessage: message,
            botResponse,
            sourceVideos: JSON.stringify([]), // TODO: Add RAG retrieval
            sourceRecipes: JSON.stringify([]), // TODO: Add recipe retrieval
          });
        }

        return {
          userMessage: message,
          botResponse,
          sourceVideos: [],
          sourceRecipes: [],
          timestamp: new Date(),
        };
      } catch (error) {
        console.error("Error in sendMessage:", error);
        throw new Error("Failed to process your message");
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
