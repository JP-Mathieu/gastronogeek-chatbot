import axios from "axios";

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const GASTRONOGEEK_CHANNEL_ID = "UCfI1q93ZYNR_mJYKFEqxfrA";
const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  channelId: string;
  publishedAt: string;
  thumbnails: {
    default?: { url: string };
    medium?: { url: string };
    high?: { url: string };
  };
}

interface YouTubeVideoDetails {
  id: string;
  snippet: {
    title: string;
    description: string;
    publishedAt: string;
    thumbnails: {
      default?: { url: string };
      medium?: { url: string };
      high?: { url: string };
    };
  };
  contentDetails: {
    duration: string;
  };
  statistics: {
    viewCount: string;
  };
}

/**
 * Convert YouTube duration format (PT1H30M45S) to seconds
 */
function parseYouTubeDuration(duration: string): number {
  const regex = /PT(\d+H)?(\d+M)?(\d+S)?/;
  const matches = duration.match(regex);

  let hours = 0;
  let minutes = 0;
  let seconds = 0;

  if (matches?.[1]) hours = parseInt(matches[1]);
  if (matches?.[2]) minutes = parseInt(matches[2]);
  if (matches?.[3]) seconds = parseInt(matches[3]);

  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Fetch videos from Gastronogeek's YouTube channel
 */
export async function fetchGastronogeekVideos(
  maxResults: number = 50,
  pageToken?: string
) {
  try {
    if (!YOUTUBE_API_KEY) {
      throw new Error("YOUTUBE_API_KEY is not set");
    }

    // First, search for videos in the channel
    const searchResponse = await axios.get(`${YOUTUBE_API_BASE}/search`, {
      params: {
        part: "snippet",
        channelId: GASTRONOGEEK_CHANNEL_ID,
        type: "video",
        maxResults: Math.min(maxResults, 50),
        pageToken: pageToken,
        key: YOUTUBE_API_KEY,
        order: "date",
      },
    });

    const videoIds = searchResponse.data.items
      .map((item: any) => item.id.videoId)
      .filter(Boolean);

    if (videoIds.length === 0) {
      return { videos: [], nextPageToken: null };
    }

    // Get detailed information about the videos
    const videosResponse = await axios.get(`${YOUTUBE_API_BASE}/videos`, {
      params: {
        part: "snippet,contentDetails,statistics",
        id: videoIds.join(","),
        key: YOUTUBE_API_KEY,
      },
    });

    const videos = videosResponse.data.items.map((video: YouTubeVideoDetails) => ({
      videoId: video.id,
      platform: "youtube",
      title: video.snippet.title,
      description: video.snippet.description,
      url: `https://www.youtube.com/watch?v=${video.id}`,
      thumbnailUrl:
        video.snippet.thumbnails.high?.url ||
        video.snippet.thumbnails.medium?.url ||
        video.snippet.thumbnails.default?.url,
      publishedAt: new Date(video.snippet.publishedAt),
      duration: parseYouTubeDuration(video.contentDetails.duration),
      viewCount: parseInt(video.statistics.viewCount || "0"),
    }));

    return {
      videos,
      nextPageToken: searchResponse.data.nextPageToken,
    };
  } catch (error) {
    console.error("Error fetching Gastronogeek videos:", error);
    throw error;
  }
}

/**
 * Fetch video captions/transcripts (if available)
 * Note: This requires additional setup with YouTube Captions API
 */
export async function fetchVideoTranscript(videoId: string): Promise<string | null> {
  try {
    // This is a placeholder - actual transcript fetching would require:
    // 1. Using youtube-transcript-api or similar library
    // 2. Handling authentication and rate limiting
    // 3. Parsing caption data

    console.log(`Fetching transcript for video: ${videoId}`);
    // For now, we'll return null and implement this in a future phase
    return null;
  } catch (error) {
    console.error(`Error fetching transcript for ${videoId}:`, error);
    return null;
  }
}

/**
 * Extract recipe information from video description
 * This uses heuristics to identify recipe-like content
 */
export function extractRecipeFromDescription(
  description: string
): { ingredients: string[]; instructions: string[] } | null {
  const lines = description.split("\n").filter((line) => line.trim());

  const ingredients: string[] = [];
  const instructions: string[] = [];

  let currentSection = "";

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Detect section headers
    if (
      trimmedLine.toLowerCase().includes("ingredient") ||
      trimmedLine.toLowerCase().includes("ingrédient")
    ) {
      currentSection = "ingredients";
      continue;
    }

    if (
      trimmedLine.toLowerCase().includes("instruction") ||
      trimmedLine.toLowerCase().includes("step") ||
      trimmedLine.toLowerCase().includes("étape")
    ) {
      currentSection = "instructions";
      continue;
    }

    // Add content to appropriate section
    if (currentSection === "ingredients" && trimmedLine.length > 0) {
      ingredients.push(trimmedLine);
    } else if (currentSection === "instructions" && trimmedLine.length > 0) {
      instructions.push(trimmedLine);
    }
  }

  if (ingredients.length > 0 || instructions.length > 0) {
    return { ingredients, instructions };
  }

  return null;
}

/**
 * Process and store videos in the database
 */
export async function processAndStoreVideos(videos: any[], db: any) {
  const results = [];

  for (const video of videos) {
    try {
      // Check if video already exists
      const existing = await db
        .select()
        .from("videos")
        .where({ videoId: video.videoId })
        .limit(1);

      if (existing.length > 0) {
        console.log(`Video already exists: ${video.title}`);
        continue;
      }

      // Extract recipe information if available
      const recipeData = extractRecipeFromDescription(video.description);

      // Insert video
      const insertedVideo = await db.insert("videos").values({
        videoId: video.videoId,
        platform: video.platform,
        title: video.title,
        description: video.description,
        url: video.url,
        thumbnailUrl: video.thumbnailUrl,
        publishedAt: video.publishedAt,
        duration: video.duration,
        viewCount: video.viewCount,
        transcript: null, // TODO: Fetch transcripts
        embedding: null, // TODO: Generate embeddings
      });

      // If recipe data was found, insert recipe
      if (recipeData) {
        await db.insert("recipes").values({
          videoId: insertedVideo.insertId,
          title: video.title,
          description: video.description,
          ingredients: JSON.stringify(recipeData.ingredients),
          instructions: JSON.stringify(recipeData.instructions),
          tags: JSON.stringify(["gastronogeek", "cooking"]),
        });
      }

      results.push({
        success: true,
        videoId: video.videoId,
        title: video.title,
      });
    } catch (error) {
      console.error(`Error processing video ${video.videoId}:`, error);
      results.push({
        success: false,
        videoId: video.videoId,
        error: String(error),
      });
    }
  }

  return results;
}
