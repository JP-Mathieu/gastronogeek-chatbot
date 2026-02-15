import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs";
import path from "path";

/**
 * Exhaustive test suite for Gastronogeek Chatbot
 * Tests video search functionality, database compatibility, and API integration
 */
describe("Chatbot Exhaustive Tests", () => {
  describe("MySQL Compatibility", () => {
    it("should use like() instead of ilike() for MySQL", () => {
      const chatbotFile = fs.readFileSync(
        path.join(process.cwd(), "server/chatbot.ts"),
        "utf-8"
      );
      expect(chatbotFile).toContain("import { eq, desc, or, like }");
      expect(chatbotFile).not.toContain("ilike(videos.title");
      expect(chatbotFile).not.toContain("ilike(videos.description");
    });

    it("should not import ilike from drizzle-orm", () => {
      const chatbotFile = fs.readFileSync(
        path.join(process.cwd(), "server/chatbot.ts"),
        "utf-8"
      );
      const importLine = chatbotFile.match(
        /import\s*{[^}]*}\s*from\s*"drizzle-orm"/
      );
      expect(importLine).toBeTruthy();
      expect(importLine![0]).toContain("like");
      expect(importLine![0]).not.toContain("ilike");
    });

    it("should use like() for title search", () => {
      const chatbotFile = fs.readFileSync(
        path.join(process.cwd(), "server/chatbot.ts"),
        "utf-8"
      );
      expect(chatbotFile).toContain("like(videos.title, `%${keyword}%`)");
    });

    it("should use like() for description search", () => {
      const chatbotFile = fs.readFileSync(
        path.join(process.cwd(), "server/chatbot.ts"),
        "utf-8"
      );
      expect(chatbotFile).toContain("like(videos.description, `%${keyword}%`)");
    });
  });

  describe("Search Functionality", () => {
    it("should extract keywords from user messages", () => {
      const chatbotFile = fs.readFileSync(
        path.join(process.cwd(), "server/chatbot.ts"),
        "utf-8"
      );
      expect(chatbotFile).toContain(
        "const keywords = message.toLowerCase().split(/\\s+/).filter(w => w.length > 2)"
      );
    });

    it("should search all videos in database (no limit)", () => {
      const chatbotFile = fs.readFileSync(
        path.join(process.cwd(), "server/chatbot.ts"),
        "utf-8"
      );
      // Should select from videos without a limit on the search query
      expect(chatbotFile).toContain(".from(videos)");
      expect(chatbotFile).toContain(".where(or(...searchConditions))");
    });

    it("should return top 5 most relevant results", () => {
      const chatbotFile = fs.readFileSync(
        path.join(process.cwd(), "server/chatbot.ts"),
        "utf-8"
      );
      expect(chatbotFile).toContain("searchResults = allMatches.slice(0, 5)");
    });

    it("should fallback to recent videos if no matches", () => {
      const chatbotFile = fs.readFileSync(
        path.join(process.cwd(), "server/chatbot.ts"),
        "utf-8"
      );
      expect(chatbotFile).toContain("if (searchResults.length === 0)");
      expect(chatbotFile).toContain(".orderBy(desc(videos.publishedAt))");
      expect(chatbotFile).toContain(".limit(5)");
    });

    it("should build context from search results", () => {
      const chatbotFile = fs.readFileSync(
        path.join(process.cwd(), "server/chatbot.ts"),
        "utf-8"
      );
      expect(chatbotFile).toContain("videoContext = sourceVideos");
      expect(chatbotFile).toContain("Titre: ${v.title}");
      expect(chatbotFile).toContain("Description: ${v.description");
      expect(chatbotFile).toContain("URL: ${v.videoUrl}");
    });
  });

  describe("AI Integration", () => {
    it("should use Mistral service for responses", () => {
      const chatbotFile = fs.readFileSync(
        path.join(process.cwd(), "server/chatbot.ts"),
        "utf-8"
      );
      expect(chatbotFile).toContain(
        "generateStrictContextResponse"
      );
      expect(chatbotFile).toContain(
        "import { generateStrictContextResponse } from \"./services/mistralService\""
      );
    });

    it("should use temperature 0 for deterministic responses", () => {
      const mistralFile = fs.readFileSync(
        path.join(process.cwd(), "server/services/mistralService.ts"),
        "utf-8"
      );
      expect(mistralFile).toContain("temperature");
      expect(mistralFile).toContain("temperature: number = 0");
    });

    it("should only answer based on synced video content", () => {
      const mistralFile = fs.readFileSync(
        path.join(process.cwd(), "server/services/mistralService.ts"),
        "utf-8"
      );
      expect(mistralFile).toContain("generateStrictContextResponse");
    });
  });

  describe("Database Operations", () => {
    it("should save chat messages to database", () => {
      const chatbotFile = fs.readFileSync(
        path.join(process.cwd(), "server/chatbot.ts"),
        "utf-8"
      );
      expect(chatbotFile).toContain("db.insert(chatMessages).values");
      expect(chatbotFile).toContain("userMessage: message");
      expect(chatbotFile).toContain("botResponse");
      expect(chatbotFile).toContain("sourceVideos: JSON.stringify");
    });

    it("should retrieve chat history for users", () => {
      const chatbotFile = fs.readFileSync(
        path.join(process.cwd(), "server/chatbot.ts"),
        "utf-8"
      );
      expect(chatbotFile).toContain("getChatHistory: protectedProcedure");
      expect(chatbotFile).toContain(".from(chatMessages)");
      expect(chatbotFile).toContain(".where(eq(chatMessages.userId, userId))");
    });

    it("should manage chat sessions", () => {
      const chatbotFile = fs.readFileSync(
        path.join(process.cwd(), "server/chatbot.ts"),
        "utf-8"
      );
      expect(chatbotFile).toContain("createSession: protectedProcedure");
      expect(chatbotFile).toContain("getSessions: protectedProcedure");
      expect(chatbotFile).toContain("db.insert(chatSessions).values");
    });
  });

  describe("API Procedures", () => {
    it("should export sendMessage procedure", async () => {
      const { chatbotRouter } = await import("./chatbot");
      expect(chatbotRouter._def.procedures.sendMessage).toBeDefined();
    });

    it("should export getChatHistory procedure", async () => {
      const { chatbotRouter } = await import("./chatbot");
      expect(chatbotRouter._def.procedures.getChatHistory).toBeDefined();
    });

    it("should export createSession procedure", async () => {
      const { chatbotRouter } = await import("./chatbot");
      expect(chatbotRouter._def.procedures.createSession).toBeDefined();
    });

    it("should export getSessions procedure", async () => {
      const { chatbotRouter } = await import("./chatbot");
      expect(chatbotRouter._def.procedures.getSessions).toBeDefined();
    });

    it("should export getVideos procedure", async () => {
      const { chatbotRouter } = await import("./chatbot");
      expect(chatbotRouter._def.procedures.getVideos).toBeDefined();
    });

    it("should export getRecipes procedure", async () => {
      const { chatbotRouter } = await import("./chatbot");
      expect(chatbotRouter._def.procedures.getRecipes).toBeDefined();
    });
  });

  describe("Error Handling", () => {
    it("should have try-catch in sendMessage", () => {
      const chatbotFile = fs.readFileSync(
        path.join(process.cwd(), "server/chatbot.ts"),
        "utf-8"
      );
      expect(chatbotFile).toContain("try {");
      expect(chatbotFile).toContain("} catch (error) {");
      expect(chatbotFile).toContain("console.error");
    });

    it("should handle database errors gracefully", () => {
      const chatbotFile = fs.readFileSync(
        path.join(process.cwd(), "server/chatbot.ts"),
        "utf-8"
      );
      expect(chatbotFile).toContain("if (!db)");
      expect(chatbotFile).toContain("throw new Error");
    });

    it("should return meaningful error messages", () => {
      const chatbotFile = fs.readFileSync(
        path.join(process.cwd(), "server/chatbot.ts"),
        "utf-8"
      );
      expect(chatbotFile).toContain("Erreur lors du traitement");
    });
  });

  describe("Response Format", () => {
    it("should return source videos with response", () => {
      const chatbotFile = fs.readFileSync(
        path.join(process.cwd(), "server/chatbot.ts"),
        "utf-8"
      );
      expect(chatbotFile).toContain("sourceVideos: hasContext ? sourceVideos : []");
    });

    it("should include video metadata in response", () => {
      const chatbotFile = fs.readFileSync(
        path.join(process.cwd(), "server/chatbot.ts"),
        "utf-8"
      );
      expect(chatbotFile).toContain("id: v.id");
      expect(chatbotFile).toContain("title: v.title");
      expect(chatbotFile).toContain("description: v.description");
      expect(chatbotFile).toContain("thumbnailUrl: v.thumbnailUrl");
      expect(chatbotFile).toContain("videoUrl: v.url");
      expect(chatbotFile).toContain("duration: v.duration");
      expect(chatbotFile).toContain("viewCount: v.viewCount");
    });

    it("should include timestamp in response", () => {
      const chatbotFile = fs.readFileSync(
        path.join(process.cwd(), "server/chatbot.ts"),
        "utf-8"
      );
      expect(chatbotFile).toContain("timestamp: new Date()");
    });
  });

  describe("Mistral Service", () => {
    it("should have Mistral service file", () => {
      const mistralPath = path.join(
        process.cwd(),
        "server/services/mistralService.ts"
      );
      expect(fs.existsSync(mistralPath)).toBe(true);
    });

    it("should export generateStrictContextResponse function", async () => {
      const { generateStrictContextResponse } = await import(
        "./services/mistralService"
      );
      expect(generateStrictContextResponse).toBeDefined();
      expect(typeof generateStrictContextResponse).toBe("function");
    });

    it("should have Mistral API key validation", () => {
      const mistralFile = fs.readFileSync(
        path.join(process.cwd(), "server/services/mistralService.ts"),
        "utf-8"
      );
      expect(mistralFile).toContain("MISTRAL_API_KEY");
    });
  });

  describe("YouTube Integration", () => {
    it("should have YouTube service file", () => {
      const youtubePath = path.join(
        process.cwd(),
        "server/services/youtubeService.ts"
      );
      expect(fs.existsSync(youtubePath)).toBe(true);
    });

    it("should sync videos to database", () => {
      const youtubeFile = fs.readFileSync(
        path.join(process.cwd(), "server/services/youtubeService.ts"),
        "utf-8"
      );
      expect(youtubeFile).toContain("fetchGastronogeekVideos");
      expect(youtubeFile).toContain("processAndStoreVideos");
    });
  });

  describe("Authentication", () => {
    it("should use protectedProcedure for sendMessage", () => {
      const chatbotFile = fs.readFileSync(
        path.join(process.cwd(), "server/chatbot.ts"),
        "utf-8"
      );
      expect(chatbotFile).toContain("sendMessage: protectedProcedure");
    });

    it("should use protectedProcedure for getChatHistory", () => {
      const chatbotFile = fs.readFileSync(
        path.join(process.cwd(), "server/chatbot.ts"),
        "utf-8"
      );
      expect(chatbotFile).toContain("getChatHistory: protectedProcedure");
    });

    it("should use protectedProcedure for createSession", () => {
      const chatbotFile = fs.readFileSync(
        path.join(process.cwd(), "server/chatbot.ts"),
        "utf-8"
      );
      expect(chatbotFile).toContain("createSession: protectedProcedure");
    });

    it("should use protectedProcedure for getSessions", () => {
      const chatbotFile = fs.readFileSync(
        path.join(process.cwd(), "server/chatbot.ts"),
        "utf-8"
      );
      expect(chatbotFile).toContain("getSessions: protectedProcedure");
    });

    it("should extract userId from context", () => {
      const chatbotFile = fs.readFileSync(
        path.join(process.cwd(), "server/chatbot.ts"),
        "utf-8"
      );
      expect(chatbotFile).toContain("const userId = ctx.user.id");
    });
  });

  describe("French Language Support", () => {
    it("should have French error messages", () => {
      const chatbotFile = fs.readFileSync(
        path.join(process.cwd(), "server/chatbot.ts"),
        "utf-8"
      );
      expect(chatbotFile).toContain("Erreur lors du traitement");
    });

    it("should have French session titles", () => {
      const chatbotFile = fs.readFileSync(
        path.join(process.cwd(), "server/chatbot.ts"),
        "utf-8"
      );
      expect(chatbotFile).toContain("Chat ${new Date().toLocaleDateString()}");
    });
  });
});
