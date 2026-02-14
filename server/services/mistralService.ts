import { Mistral } from "@mistralai/mistralai";

const apiKey = process.env.MISTRAL_API_KEY;

if (!apiKey) {
  throw new Error("MISTRAL_API_KEY environment variable is not set");
}

const client = new Mistral({ apiKey });

/**
 * Generate a response using Mistral AI
 */
export async function generateMistralResponse(
  userMessage: string,
  systemPrompt: string = "You are a helpful cooking assistant. Answer questions about recipes and cooking techniques."
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
 * Generate a response with context from videos
 */
export async function generateContextualResponse(
  userMessage: string,
  context: string
): Promise<string> {
  const systemPrompt = `You are a helpful cooking assistant powered by Gastronogeek's video content.
Use the provided context from videos to answer questions about recipes and cooking techniques.
If the context doesn't contain relevant information, provide general cooking advice based on your knowledge.
Always be friendly and encouraging.

Context from videos:
${context}`;

  return generateMistralResponse(userMessage, systemPrompt);
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
