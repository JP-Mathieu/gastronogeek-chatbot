import { describe, it, expect } from "vitest";
import { getDb } from "./db";
import { videos } from "../drizzle/schema";
import { like, or, desc } from "drizzle-orm";
import { generateStrictContextResponse } from "./services/mistralService";

/**
 * Debug test to verify Mistral context and responses
 */
describe("Debug Mistral Context", () => {
  it("should build correct context from donut video", async () => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    // Simulate the exact search that happens in chatbot.ts
    console.log("\n=== Building context for 'comment faire des donuts?' ===");
    const message = "comment faire des donuts?";
    const cleanMessage = message.toLowerCase().replace(/[^a-zàâäæçéèêëïîôœùûüœ\s]/g, '');
    const keywords = cleanMessage.split(/\s+/).filter(w => w.length > 2);
    
    console.log(`Message: "${message}"`);
    console.log(`Keywords: ${JSON.stringify(keywords)}`);
    
    let searchResults: any[] = [];
    
    if (keywords.length > 0) {
      const stopWords = ['comment', 'faire', 'pour', 'quoi', 'quel', 'avec', 'dans', 'peut', 'peux', 'dois', 'doit'];
      const meaningfulKeywords = keywords.filter(k => !stopWords.includes(k) && k.length > 3);
      
      console.log(`Meaningful keywords: ${JSON.stringify(meaningfulKeywords)}`);
      
      if (meaningfulKeywords.length > 0) {
        const meaningfulConditions = meaningfulKeywords.flatMap(keyword => [
          like(videos.title, `%${keyword}%`),
          like(videos.description, `%${keyword}%`),
        ]);
        
        const meaningfulMatches = await db
          .select()
          .from(videos)
          .where(or(...meaningfulConditions))
          .orderBy(desc(videos.publishedAt));
        
        console.log(`Found ${meaningfulMatches.length} videos with meaningful keywords`);
        searchResults = meaningfulMatches.slice(0, 5);
      }
    }
    
    // Build context exactly as chatbot.ts does
    const sourceVideos = searchResults.map(v => ({
      id: v.id,
      title: v.title,
      description: v.description,
      thumbnailUrl: v.thumbnailUrl,
      videoUrl: v.url,
      duration: v.duration,
      viewCount: v.viewCount,
    }));
    
    const videoContext = sourceVideos
      .map(v => `Titre: ${v.title}\nDescription: ${v.description || 'N/A'}\nURL: ${v.videoUrl}`)
      .join("\n\n");
    
    console.log("\n=== VIDEO CONTEXT ===");
    console.log(videoContext);
    console.log("=== END CONTEXT ===\n");
    
    expect(videoContext.length).toBeGreaterThan(0);
    expect(videoContext).toContain("donut");
  });

  it("should generate response using video context", async () => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    // Get the donut video
    console.log("\n=== Testing Mistral Response ===");
    const donutVideos = await db
      .select()
      .from(videos)
      .where(like(videos.title, "%donut%"))
      .limit(1);
    
    if (donutVideos.length === 0) {
      console.log("No donut video found");
      expect(donutVideos.length).toBeGreaterThan(0);
      return;
    }
    
    const video = donutVideos[0];
    console.log(`Found video: ${video.title}`);
    
    // Build context
    const videoContext = `Titre: ${video.title}\nDescription: ${video.description || 'N/A'}\nURL: ${video.url}`;
    
    console.log("\nContext sent to Mistral:");
    console.log(videoContext);
    
    // Test the response
    const userMessage = "comment faire des donuts?";
    console.log(`\nUser message: "${userMessage}"`);
    
    const { response, hasContext } = await generateStrictContextResponse(userMessage, videoContext);
    
    console.log(`\nHas context: ${hasContext}`);
    console.log(`Response from Mistral:\n${response}`);
    
    // Verify response uses context
    expect(hasContext).toBe(true);
    expect(response.length).toBeGreaterThan(0);
    
    // Check if response mentions donuts or the video title
    const responseLower = response.toLowerCase();
    const contextLower = videoContext.toLowerCase();
    
    console.log(`\nResponse mentions 'donut': ${responseLower.includes('donut')}`);
    console.log(`Response mentions video title: ${responseLower.includes(video.title.toLowerCase())}`);
  }, 30000); // 30 second timeout for Mistral API

  it("should verify context is not empty", async () => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    const allVideos = await db.select().from(videos).limit(1);
    
    if (allVideos.length > 0) {
      const video = allVideos[0];
      const context = `Titre: ${video.title}\nDescription: ${video.description}`;
      
      console.log(`\nContext length: ${context.length}`);
      console.log(`Context is not empty: ${context.trim().length > 0}`);
      
      expect(context.trim().length).toBeGreaterThan(0);
    }
  });
});
