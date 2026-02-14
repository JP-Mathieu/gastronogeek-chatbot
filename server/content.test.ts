import { describe, it, expect } from "vitest";

describe("Content Router", () => {
  it("should export contentRouter", async () => {
    const { contentRouter } = await import("./content");
    expect(contentRouter).toBeDefined();
    expect(contentRouter._def).toBeDefined();
  });

  it("should have syncYouTubeVideos procedure", async () => {
    const { contentRouter } = await import("./content");
    expect(contentRouter._def.procedures.syncYouTubeVideos).toBeDefined();
  });

  it("should have getStoredVideos procedure", async () => {
    const { contentRouter } = await import("./content");
    expect(contentRouter._def.procedures.getStoredVideos).toBeDefined();
  });

  it("should have getVideoCount procedure", async () => {
    const { contentRouter } = await import("./content");
    expect(contentRouter._def.procedures.getVideoCount).toBeDefined();
  });

  it("should have searchVideos procedure", async () => {
    const { contentRouter } = await import("./content");
    expect(contentRouter._def.procedures.searchVideos).toBeDefined();
  });

  it("should have YouTube service available", async () => {
    const { fetchGastronogeekVideos } = await import(
      "./services/youtubeService"
    );
    expect(fetchGastronogeekVideos).toBeDefined();
    expect(typeof fetchGastronogeekVideos).toBe("function");
  });
});
