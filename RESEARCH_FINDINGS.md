# Gastronogeek Chatbot - Research Findings

## Project Overview
Building a web-based chatbot that uses Gastronogeek's public video content from YouTube, Instagram, Twitch, and TikTok to answer cooking-related queries.

## Gastronogeek Creator Profile
- **Name**: Thibaud Villanova (Gastronogeek)
- **Focus**: Cooking recipes inspired by anime, movies, games, and pop culture
- **Platforms**:
  - YouTube: 330K+ subscribers, 362+ videos
  - Instagram: 360K followers, 1,986+ posts
  - TikTok: 367.7K followers, 4.4M likes
  - Twitch: 95.6K followers (live cooking streams)
- **Official Website**: https://gastronogeek.com/
- **Published Works**: Anime cookbook with 40+ recipes

## Recommended Architecture: RAG (Retrieval-Augmented Generation)

### What is RAG?
Retrieval-Augmented Generation (RAG) is an AI framework that combines:
1. **Retrieval System**: Searches a knowledge base for relevant documents/content
2. **LLM Generation**: Uses retrieved context to generate intelligent responses

### RAG Pipeline Flow
```
User Query → Retriever (Search Knowledge Base) → Retrieved Documents
                                                          ↓
                                                    LLM Generator
                                                          ↓
                                                    Contextual Response
```

### Key Benefits for Gastronogeek Chatbot
- Grounds responses in actual Gastronogeek video content
- Provides accurate recipe information with video references
- Reduces hallucination by using real knowledge base
- Enables linking to source videos

## Content Integration Strategy

### Data Sources
1. **YouTube**: Video metadata, descriptions, transcripts (via YouTube Data API)
2. **Instagram**: Post captions and descriptions (via Instagram Graph API)
3. **TikTok**: Video metadata and descriptions (limited by API restrictions)
4. **Twitch**: VOD metadata and descriptions (via Twitch API)

### Content Processing Pipeline
1. Fetch video metadata from each platform
2. Extract text content (descriptions, captions, comments)
3. Process and clean text data
4. Create embeddings for semantic search
5. Store in vector database (e.g., FAISS, Pinecone, or Weaviate)
6. Index for fast retrieval

### Recipe Extraction
- Parse video descriptions for recipe steps
- Extract ingredients from video content
- Link recipes to source videos
- Store structured recipe data in database

## Technology Stack

### Frontend
- React with TypeScript
- Tailwind CSS for styling
- Zustand for state management
- Axios for API calls

### Backend
- Express.js with TypeScript
- PostgreSQL for structured data (chat history, user profiles)
- Vector database for embeddings (Pinecone, Weaviate, or local FAISS)
- LLM API integration (OpenAI, Anthropic, or open-source)

### AI/ML Components
- LLM for response generation (GPT-4, Claude, Llama)
- Embedding model for semantic search (OpenAI Embeddings, Sentence Transformers)
- Vector database for similarity search

## Implementation Phases

### Phase 1: Foundation
- Set up database schema for videos, recipes, and chat history
- Create basic chatbot UI
- Implement user authentication

### Phase 2: Content Integration
- Fetch Gastronogeek's video metadata from YouTube
- Extract and process recipe information
- Create vector embeddings for content

### Phase 3: RAG Implementation
- Set up vector database
- Implement retrieval logic
- Integrate LLM API
- Build context management

### Phase 4: Enhancement
- Add support for other platforms (Instagram, TikTok, Twitch)
- Improve recipe extraction accuracy
- Add recipe cards with video links
- Implement chat history and user preferences

## API Requirements

### YouTube Data API
- Requires: API key, OAuth 2.0 for accessing user data
- Provides: Video metadata, descriptions, transcripts (with captions)
- Limitations: 10,000 quota units per day (free tier)

### LLM API (e.g., OpenAI)
- Requires: API key
- Provides: Text generation, embeddings
- Cost: Pay-as-you-go model

### Vector Database
- Options: Pinecone (managed), Weaviate (self-hosted), FAISS (local)
- Purpose: Store and search embeddings efficiently

## Next Steps
1. Set up database schema
2. Create chatbot UI
3. Integrate YouTube API for content fetching
4. Implement RAG pipeline with LLM
5. Test and refine responses
6. Deploy to production
