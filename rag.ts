/**
 * RAG (Retrieval-Augmented Generation) Module
 * Retrieves current events and contextual information to ground LLM responses
 */

import { invokeLLM } from "./_core/llm";

interface SearchResult {
  title: string;
  snippet: string;
  source: string;
  url: string;
  date?: string;
}

interface RAGContext {
  query: string;
  results: SearchResult[];
  systemPrompt: string;
}

/**
 * Search for current events and contextual information
 * Uses built-in Forge API for web search
 */
export async function searchCurrentEvents(query: string, limit: number = 3): Promise<SearchResult[]> {
  try {
    // Use the built-in Forge API for web search
    const response = await fetch(`${process.env.BUILT_IN_FORGE_API_URL}/api/search`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        limit,
        type: 'news',
      }),
    });

    if (!response.ok) {
      console.warn(`[RAG] Search failed: ${response.statusText}`);
      return [];
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('[RAG] Search error:', error);
    return [];
  }
}

/**
 * Extract key topics from user query for better search
 */
export function extractSearchTopics(userMessage: string): string[] {
  const words = userMessage.split(/\s+/);
  const topics: string[] = [];

  words.forEach((word) => {
    if (/^[A-Z][a-z]+/.test(word)) {
      topics.push(word.replace(/[.,!?;:]/g, ''));
    }
    if (/^\d{4}$/.test(word)) {
      topics.push(word);
    }
  });

  if (topics.length === 0) {
    return [userMessage.substring(0, 100)];
  }

  return topics.slice(0, 3);
}

/**
 * Build system prompt from RAG results
 */
export function buildRAGSystemPrompt(results: SearchResult[]): string {
  if (results.length === 0) return '';
  
  let prompt = '\n\n## Current Context (Retrieved Information):\n';
  results.forEach((result, idx) => {
    prompt += `\n${idx + 1}. **${result.title}** (${result.date || 'Recent'})\n`;
    prompt += `   ${result.snippet}\n`;
    prompt += `   Source: ${result.source}\n`;
  });
  prompt += '\nUse this current information to provide context-aware responses.';
  return prompt;
}

/**
 * Build RAG context for LLM
 */
export async function buildRAGContext(userMessage: string): Promise<RAGContext> {
  const topics = extractSearchTopics(userMessage);
  const searchQuery = topics.join(' ');

  const results = await searchCurrentEvents(searchQuery, 3);
  const systemPrompt = buildRAGSystemPrompt(results);

  return {
    query: searchQuery,
    results,
    systemPrompt,
  };
}

/**
 * Cache for recent searches to reduce API calls
 */
const searchCache = new Map<string, { results: SearchResult[]; timestamp: number }>();
const CACHE_TTL = 3600000; // 1 hour

/**
 * Cached search with TTL
 */
export async function searchWithCache(query: string): Promise<SearchResult[]> {
  const cached = searchCache.get(query);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.results;
  }

  const results = await searchCurrentEvents(query, 3);
  searchCache.set(query, { results, timestamp: Date.now() });

  return results;
}

/**
 * Send message with RAG context
 */
export async function sendMessageWithRAG(
  userMessage: string,
  conversationHistory: Array<{ role: string; content: string }>,
  includeRAG: boolean = true
): Promise<string> {
  let ragContext: RAGContext | null = null;
  let systemPrompt = `You are SYNTHAI Orchestrator, an autonomous AI partner managing modular AI scaffolding systems (GNN, Resonance, Embodied Reality). 
You are knowledgeable, casual, supportive, and direct. You understand code, architecture, and complex systems. 
You remember context across conversations and help users build, evolve, and understand their modular AI systems.`;

  // Fetch RAG context if enabled
  if (includeRAG) {
    ragContext = await buildRAGContext(userMessage);
    systemPrompt += ragContext.systemPrompt;
  }

  // Build messages array
  const messages = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory,
    { role: 'user', content: userMessage },
  ];

  // Call LLM with context
  const response = await invokeLLM({
    messages: messages as any,
  });

  const assistantMessage = response.choices?.[0]?.message?.content as string || '';
  return assistantMessage;
}
