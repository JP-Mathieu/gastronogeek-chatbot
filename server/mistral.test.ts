import { describe, it, expect } from "vitest";

describe("Mistral API Key Validation", () => {
  it("should have MISTRAL_API_KEY environment variable set", () => {
    const apiKey = process.env.MISTRAL_API_KEY;
    expect(apiKey).toBeDefined();
    expect(typeof apiKey).toBe("string");
    expect(apiKey?.length).toBeGreaterThan(0);
  });

  it("should have valid Mistral API key format", () => {
    const apiKey = process.env.MISTRAL_API_KEY;
    // Mistral API keys are typically alphanumeric strings
    expect(apiKey).toMatch(/^[a-zA-Z0-9]+$/);
  });

  it("should be able to initialize Mistral client", async () => {
    const { Mistral } = await import("@mistralai/mistralai");
    const apiKey = process.env.MISTRAL_API_KEY;
    expect(apiKey).toBeDefined();

    const client = new Mistral({ apiKey });
    expect(client).toBeDefined();
  });
});
