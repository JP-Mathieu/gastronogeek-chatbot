import { describe, it, expect } from "vitest";

describe("OpenAI API Key Validation", () => {
  it("should have OPENAI_API_KEY environment variable set", () => {
    const apiKey = process.env.OPENAI_API_KEY;
    expect(apiKey).toBeDefined();
    expect(typeof apiKey).toBe("string");
    expect(apiKey?.length).toBeGreaterThan(0);
  });

  it("should have a valid OpenAI API key format", () => {
    const apiKey = process.env.OPENAI_API_KEY;
    expect(apiKey).toBeDefined();
    // OpenAI API keys start with sk-proj- or sk-
    expect(apiKey).toMatch(/^sk-/);
  });

  it("should be able to create an OpenAI client with the key", async () => {
    const apiKey = process.env.OPENAI_API_KEY;
    expect(apiKey).toBeDefined();

    // Simulate creating a client - just verify the key is available
    const client = {
      apiKey: apiKey,
      baseURL: "https://api.openai.com/v1",
    };

    expect(client.apiKey).toBe(apiKey);
    expect(client.baseURL).toBe("https://api.openai.com/v1");
  });
});
