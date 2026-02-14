import { Mistral } from "@mistralai/mistralai";

const apiKey = process.env.MISTRAL_API_KEY;

if (!apiKey) {
  throw new Error("MISTRAL_API_KEY environment variable is not set");
}

const client = new Mistral({ apiKey });

/**
 * Generate a response using Mistral AI with temperature 0 (deterministic)
 */
export async function generateMistralResponse(
  userMessage: string,
  systemPrompt: string = "You are a helpful cooking assistant. Answer questions about recipes and cooking techniques.",
  temperature: number = 0
): Promise<string> {
  try {
    const response = await client.chat.complete({
      model: "mistral-large-latest",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
      maxTokens: 1024,
      temperature,
    });

    const message = response.choices?.[0]?.message?.content;
    if (!message) {
      throw new Error("No response content from Mistral");
    }

    // Handle both string and ContentChunk[] types
    if (typeof message === "string") {
      return message;
    }

    // If it's an array of content chunks, extract text from first chunk
    if (Array.isArray(message) && message.length > 0) {
      const chunk = message[0] as any;
      return chunk.text || "";
    }

    return "";
  } catch (error) {
    console.error("Error generating Mistral response:", error);
    throw error;
  }
}

/**
 * Generate embeddings using Mistral AI
 */
export async function generateMistralEmbedding(
  text: string
): Promise<number[]> {
  try {
    const response = await client.embeddings.create({
      model: "mistral-embed",
      inputs: text,
    });

    const embeddings = response.data;
    if (!embeddings || embeddings.length === 0) {
      throw new Error("No embedding data from Mistral");
    }

    const embedding = embeddings[0].embedding;
    if (!embedding) {
      throw new Error("No embedding vector from Mistral");
    }

    return embedding;
  } catch (error) {
    console.error("Error generating Mistral embedding:", error);
    throw error;
  }
}

/**
 * Generate a response with context from videos (temperature 0 - no hallucinations)
 */
export async function generateContextualResponse(
  userMessage: string,
  context: string
): Promise<string> {
  const systemPrompt = `You are a cooking assistant powered by Gastronogeek's video content.
You MUST ONLY answer questions based on the provided context from videos.
If the context is empty or doesn't contain relevant information, you MUST respond with:
"Je n'ai pas trouvé de vidéo correspondante dans notre base de données. Je vous recommande de consulter directement les chaînes de Gastronogeek (YouTube, Instagram, TikTok, Twitch) ou ses livres de recettes pour plus d'informations."

Do NOT infer, guess, or provide general cooking advice. Only use the provided context.
Always be helpful and direct users to Gastronogeek's official sources.

Context from videos:
${context || "[Aucune vidéo disponible]"}`;

  return generateMistralResponse(userMessage, systemPrompt, 0);
}

/**
 * Generate a response that only uses provided context (strict mode)
 */
export async function generateStrictContextResponse(
  userMessage: string,
  videoContext: string
): Promise<{ response: string; hasContext: boolean }> {
  const hasContext = videoContext && videoContext.trim().length > 0;
  
  if (!hasContext) {
    return {
      response: "Je n'ai pas trouvé de vidéo correspondante dans notre base de données. Je vous recommande de consulter directement les chaînes de Gastronogeek (YouTube, Instagram, TikTok, Twitch) ou ses livres de recettes pour plus d'informations.",
      hasContext: false,
    };
  }

  const response = await generateContextualResponse(userMessage, videoContext);
  return {
    response,
    hasContext: true,
  };
}

/**
 * Test the Mistral API connection
 */
export async function testMistralConnection(): Promise<boolean> {
  try {
    const response = await generateMistralResponse(
      "Hello, are you working?",
      "You are a helpful assistant."
    );
    return response.length > 0;
  } catch (error) {
    console.error("Mistral connection test failed:", error);
    return false;
  }
}

export { client as mistralClient };
