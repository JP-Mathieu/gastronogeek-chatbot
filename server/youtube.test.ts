import { describe, it, expect } from "vitest";

describe("YouTube API Key Validation", () => {
  it("should have YOUTUBE_API_KEY environment variable set", () => {
    const apiKey = process.env.YOUTUBE_API_KEY;
    expect(apiKey).toBeDefined();
    expect(typeof apiKey).toBe("string");
    expect(apiKey?.length).toBeGreaterThan(0);
  });

  it("should have a valid YouTube API key format", () => {
    const apiKey = process.env.YOUTUBE_API_KEY;
    expect(apiKey).toBeDefined();
    // YouTube API keys are typically alphanumeric strings
    expect(apiKey).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it("should be able to construct a YouTube API request URL", () => {
    const apiKey = process.env.YOUTUBE_API_KEY;
    expect(apiKey).toBeDefined();

    // Test constructing a valid YouTube API URL
    const channelId = "UCfI1q93ZYNR_mJYKFEqxfrA"; // Gastronogeek's channel ID
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&type=video&maxResults=10&key=${apiKey}`;

    expect(url).toContain("googleapis.com");
    expect(url).toContain("youtube/v3");
    expect(url).toContain(apiKey);
    expect(url).toContain(channelId);
  });
});
