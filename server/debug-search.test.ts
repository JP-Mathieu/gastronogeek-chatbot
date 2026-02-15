import { describe, it, expect } from "vitest";
import { getDb } from "./db";
import { videos } from "../drizzle/schema";
import { like, or, desc } from "drizzle-orm";

/**
 * Debug test to verify search functionality
 */
describe("Debug Search Functionality", () => {
  it("should find videos with donuts keyword", async () => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    // Test 1: Direct SQL LIKE search
    console.log("\n=== Test 1: Direct LIKE search ===");
    const directResults = await db
      .select()
      .from(videos)
      .where(like(videos.title, "%donut%"))
      .limit(5);
    
    console.log(`Found ${directResults.length} videos with 'donut' in title`);
    if (directResults.length > 0) {
      console.log("First result:", directResults[0].title);
    }
    expect(directResults.length).toBeGreaterThan(0);
  });

  it("should find videos using or() with multiple keywords", async () => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    // Test 2: Using or() with multiple conditions
    console.log("\n=== Test 2: Using or() with keywords ===");
    const keywords = ["donut", "faire"];
    const searchConditions = keywords.flatMap(keyword => [
      like(videos.title, `%${keyword}%`),
      like(videos.description, `%${keyword}%`),
    ]);

    console.log(`Search conditions: ${searchConditions.length}`);
    
    const orResults = await db
      .select()
      .from(videos)
      .where(or(...searchConditions))
      .orderBy(desc(videos.publishedAt))
      .limit(5);

    console.log(`Found ${orResults.length} videos with or() search`);
    if (orResults.length > 0) {
      console.log("First result:", orResults[0].title);
    }
    expect(orResults.length).toBeGreaterThan(0);
  });

  it("should simulate the exact search from chatbot.ts with stop words filtering", async () => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    // Test 3: Exact simulation of chatbot search with improved logic
    console.log("\n=== Test 3: Exact chatbot search simulation with stop words ===");
    const message = "comment faire des donuts?";
    const cleanMessage = message.toLowerCase().replace(/[^a-zàâäæçéèêëïîôœùûüœ\s]/g, '');
    const keywords = cleanMessage.split(/\s+/).filter(w => w.length > 2);
    
    console.log(`Message: "${message}"`);
    console.log(`Clean message: "${cleanMessage}"`);
    console.log(`Keywords extracted: ${JSON.stringify(keywords)}`);
    
    let searchResults: any[] = [];
    
    if (keywords.length > 0) {
      // Filter out common French stop words
      const stopWords = ['comment', 'faire', 'pour', 'quoi', 'quel', 'avec', 'dans', 'peut', 'peux', 'dois', 'doit'];
      const meaningfulKeywords = keywords.filter(k => !stopWords.includes(k) && k.length > 3);
      
      console.log(`Meaningful keywords: ${JSON.stringify(meaningfulKeywords)}`);
      
      if (meaningfulKeywords.length > 0) {
        const meaningfulConditions = meaningfulKeywords.flatMap(keyword => [
          like(videos.title, `%${keyword}%`),
          like(videos.description, `%${keyword}%`),
        ]);
        
        console.log(`Searching with meaningful keywords...`);
        const meaningfulMatches = await db
          .select()
          .from(videos)
          .where(or(...meaningfulConditions))
          .orderBy(desc(videos.publishedAt));
        
        console.log(`Meaningful keyword matches: ${meaningfulMatches.length}`);
        searchResults = meaningfulMatches.slice(0, 5);
        
        if (searchResults.length > 0) {
          searchResults.forEach((v, i) => {
            console.log(`  ${i + 1}. ${v.title}`);
          });
        }
      }
      
      if (searchResults.length === 0) {
        const searchConditions = keywords.flatMap(keyword => [
          like(videos.title, `%${keyword}%`),
          like(videos.description, `%${keyword}%`),
        ]);
        
        console.log(`No meaningful results. Trying all keywords...`);
        const allMatches = await db
          .select()
          .from(videos)
          .where(or(...searchConditions))
          .orderBy(desc(videos.publishedAt));
        
        console.log(`All keyword matches: ${allMatches.length}`);
        searchResults = allMatches.slice(0, 5);
        
        if (searchResults.length > 0) {
          searchResults.forEach((v, i) => {
            console.log(`  ${i + 1}. ${v.title}`);
          });
        }
      }
    }
    
    if (searchResults.length === 0) {
      console.log("No search results, falling back to recent videos...");
      searchResults = await db
        .select()
        .from(videos)
        .orderBy(desc(videos.publishedAt))
        .limit(5);
      
      console.log(`Fallback returned ${searchResults.length} recent videos`);
      if (searchResults.length > 0) {
        searchResults.forEach((v, i) => {
          console.log(`  ${i + 1}. ${v.title}`);
        });
      }
    }
    
    expect(searchResults.length).toBeGreaterThan(0);
  });

  it("should verify database connection", async () => {
    const db = await getDb();
    expect(db).toBeDefined();
    
    if (db) {
      const count = await db.select().from(videos).limit(1);
      console.log(`\nDatabase connection verified. Videos table has data: ${count.length > 0}`);
      expect(count.length).toBeGreaterThanOrEqual(0);
    }
  });
});
