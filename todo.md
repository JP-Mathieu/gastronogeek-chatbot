# Gastronogeek Chatbot - Project TODO

## Core Features
- [x] Set up project structure and dependencies
- [x] Create database schema for storing video metadata and recipes
- [x] Build chatbot UI with message interface
- [x] Integrate with LLM API for intelligent responses
- [x] Create knowledge base from Gastronogeek's video content
- [x] Implement video content scraping/indexing system
- [x] Add recipe extraction and storage
- [ ] Implement semantic search for relevant video content
- [x] Build chat history and context management
- [x] Add user authentication and profile management

## Content Integration
- [x] Fetch YouTube video metadata and transcripts
- [ ] Fetch Instagram post content and captions
- [ ] Fetch TikTok video metadata
- [ ] Fetch Twitch VOD metadata
- [x] Process and index all content for search
- [x] Extract recipes from video descriptions and comments

## UI/UX Features
- [x] Design responsive chat interface
- [x] Add message input and send functionality
- [x] Display chat history
- [ ] Add recipe cards with video links
- [x] Implement loading states and error handling
- [x] Add admin panel for content management
- [ ] Create settings/preferences page

## Testing & Deployment
- [x] Write unit tests for chatbot logic
- [x] Write unit tests for content router
- [x] Write unit tests for YouTube service
- [x] Test content indexing and search
- [ ] Performance optimization
- [ ] Create checkpoint before deployment

## Bug Fixes
- [x] Fix OAuth callback error when signing in

## Internationalization (i18n)
- [x] Add French language support to all UI pages
- [x] Create translation files for Home, Chatbot, and Admin pages
- [ ] Add language selector (optional)

## Current Issues
- [x] Fix "Failed to process your message" error in chatbot (replaced OpenAI with Mistral)

## Mistral AI Integration
- [x] Install Mistral SDK
- [x] Create Mistral service with chat and embedding functions
- [x] Replace OpenAI with Mistral in chatbot router
- [x] Test Mistral API key validation
- [x] All tests passing (8 chatbot tests, 3 mistral tests)

## Feature Requests
- [x] Display video cards in chatbot instead of transcripts (thumbnails, title, link)

## Current Feature Work
- [x] Add source links below chatbot responses

## Anti-Hallucination Features
- [x] Set Mistral temperature to 0 for deterministic responses
- [x] Modify chatbot to only answer based on synced videos
- [x] Add fallback message directing to Gastronogeek channels/books when no videos found

## Debugging
- [x] Investigate why no videos are being found in the database (YouTube API limits to 50 per request)
- [x] Check if video sync endpoint is working correctly (works, use pagination)

## Video Sync Improvements
- [x] Allow syncing more than 50 videos at once (via pagination/multiple clicks)
- [x] Add clear instructions for batch syncing
- [x] Show total available videos count

## Critical Bugs
- [x] Fix pagination - sync button now fetches next batch of videos using pageToken

## Current Issues
- [x] Chatbot not finding synced videos - implemented keyword-based search

## Debugging - Database Search Issue
- [x] Verify videos are being stored in database (confirmed - 300+ videos)
- [x] Debug why search query is not returning results (case sensitivity issue)
- [x] Fixed by replacing like() with ilike() for case-insensitive search

## Search Improvements
- [x] Increase search scope - now searches ALL videos in database, returns top 5
