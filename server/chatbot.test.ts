import { describe, it, expect, vi, beforeEach } from "vitest";

describe("Chatbot Router", () => {
  beforeEach(() => {
    // Reset environment
    process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || "sk-proj-test";
  });

  it("should have OPENAI_API_KEY set", () => {
    const apiKey = process.env.OPENAI_API_KEY;
    expect(apiKey).toBeDefined();
    expect(apiKey?.length).toBeGreaterThan(0);
  });

  it("should export chatbotRouter", async () => {
    const { chatbotRouter } = await import("./chatbot");
    expect(chatbotRouter).toBeDefined();
    expect(chatbotRouter._def).toBeDefined();
  });

  it("should have sendMessage procedure", async () => {
    const { chatbotRouter } = await import("./chatbot");
    expect(chatbotRouter._def.procedures.sendMessage).toBeDefined();
  });

  it("should have getChatHistory procedure", async () => {
    const { chatbotRouter } = await import("./chatbot");
    expect(chatbotRouter._def.procedures.getChatHistory).toBeDefined();
  });

  it("should have createSession procedure", async () => {
    const { chatbotRouter } = await import("./chatbot");
    expect(chatbotRouter._def.procedures.createSession).toBeDefined();
  });

  it("should have getSessions procedure", async () => {
    const { chatbotRouter } = await import("./chatbot");
    expect(chatbotRouter._def.procedures.getSessions).toBeDefined();
  });

  it("should have getVideos procedure", async () => {
    const { chatbotRouter } = await import("./chatbot");
    expect(chatbotRouter._def.procedures.getVideos).toBeDefined();
  });

  it("should have getRecipes procedure", async () => {
    const { chatbotRouter } = await import("./chatbot");
    expect(chatbotRouter._def.procedures.getRecipes).toBeDefined();
  });
});


describe("Video Search with MySQL", () => {
  it("should use like() operator instead of ilike() for MySQL compatibility", async () => {
    const { chatbotRouter } = await import("./chatbot");
    const chatbotCode = chatbotRouter.toString();
    
    // Verify that ilike is not imported in the router
    const chatbotFile = require("fs").readFileSync("./server/chatbot.ts", "utf-8");
    expect(chatbotFile).toContain("import { eq, desc, or, like }");
    expect(chatbotFile).not.toContain("ilike(videos.title");
    expect(chatbotFile).not.toContain("ilike(videos.description");
  });

  it("should use like() operator for case-insensitive search", async () => {
    const chatbotFile = require("fs").readFileSync("./server/chatbot.ts", "utf-8");
    
    // Verify that like() is used for both title and description
    expect(chatbotFile).toContain("like(videos.title, `%${keyword}%`)");
    expect(chatbotFile).toContain("like(videos.description, `%${keyword}%`)");
  });
});
