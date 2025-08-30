import OpenAI from 'openai';
import { useSettingsStore } from '../store/settingsStore';

export interface RelatedConcept {
  label: string;
  description: string;
  category?: string;
  relevance: number;
  relationship?: string;
}

export interface ConceptExpansionRequest {
  concept: string;
  description: string;
  context?: string[];
  maxConcepts?: number;
}

export interface ConceptExpansionResponse {
  concepts: RelatedConcept[];
  metadata: {
    model: string;
    tokensUsed: number;
    processingTime: number;
  };
}

class OpenAIService {
  private static instance: OpenAIService;
  private client: OpenAI | null = null;
  private cache: Map<string, { data: RelatedConcept[]; timestamp: number }> = new Map();
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): OpenAIService {
    if (!OpenAIService.instance) {
      OpenAIService.instance = new OpenAIService();
    }
    return OpenAIService.instance;
  }

  public async initialize(): Promise<void> {
    const settings = useSettingsStore.getState().openai;
    
    if (!settings.apiKey) {
      throw new Error('OpenAI API key is required');
    }

    try {
      this.client = new OpenAI({
        apiKey: settings.apiKey,
        dangerouslyAllowBrowser: true, // Note: In production, API calls should go through backend
      });

      // Test the connection
      await this.testConnection();
      this.isInitialized = true;
      
      console.log('OpenAI service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize OpenAI service:', error);
      throw error;
    }
  }

  private async testConnection(): Promise<void> {
    if (!this.client) {
      throw new Error('OpenAI client not initialized');
    }

    try {
      // Make a simple test request
      await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 5,
      });
    } catch (error) {
      throw new Error(`OpenAI API connection failed: ${error}`);
    }
  }

  public async generateRelatedConcepts(
    concept: string,
    description: string,
    context: string[] = []
  ): Promise<RelatedConcept[]> {
    if (!this.isInitialized || !this.client) {
      throw new Error('OpenAI service not initialized');
    }

    const settings = useSettingsStore.getState().openai;
    const cacheKey = `${concept}_${description}_${context.join('_')}`;
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < settings.cacheTimeout) {
      return cached.data;
    }

    const startTime = Date.now();

    try {
      const prompt = this.buildConceptExpansionPrompt(concept, description, context, settings.conceptsPerExpansion);
      
      const response = await this.client.chat.completions.create({
        model: settings.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert knowledge mapper that generates semantically related concepts for 3D knowledge visualization. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: settings.maxTokens,
        temperature: settings.temperature,
        response_format: { type: 'json_object' }
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response content from OpenAI');
      }

      const parsedResponse = JSON.parse(content);
      const concepts = this.parseConceptResponse(parsedResponse);

      // Cache the result
      this.cache.set(cacheKey, {
        data: concepts,
        timestamp: Date.now()
      });

      // Clean old cache entries
      this.cleanCache();

      console.log(`Generated ${concepts.length} related concepts for "${concept}" in ${Date.now() - startTime}ms`);
      
      return concepts;
    } catch (error) {
      console.error('Failed to generate related concepts:', error);
      throw new Error(`Concept generation failed: ${error}`);
    }
  }

  private buildConceptExpansionPrompt(
    concept: string,
    description: string,
    context: string[],
    maxConcepts: number
  ): string {
    const contextStr = context.length > 0 ? `\n\nExisting context: ${context.join(', ')}` : '';
    
    return `Generate ${maxConcepts} semantically related concepts for the concept "${concept}".

Description: ${description}${contextStr}

Requirements:
- Each concept should be distinct and meaningful
- Include diverse relationship types (hierarchical, causal, associative, etc.)
- Provide relevance scores between 0.1 and 1.0
- Categorize concepts appropriately
- Avoid duplicating existing context concepts

Respond with JSON in this exact format:
{
  "concepts": [
    {
      "label": "Concept Name",
      "description": "Brief description of the concept",
      "category": "category_name",
      "relevance": 0.8,
      "relationship": "type of relationship to original concept"
    }
  ]
}

Categories can include: science, technology, philosophy, art, nature, society, history, mathematics, psychology, etc.
Relationship types: "is a type of", "causes", "enables", "relates to", "part of", "opposite of", "similar to", etc.`;
  }

  private parseConceptResponse(response: any): RelatedConcept[] {
    if (!response.concepts || !Array.isArray(response.concepts)) {
      throw new Error('Invalid response format from OpenAI');
    }

    return response.concepts.map((concept: any) => ({
      label: concept.label || 'Unknown Concept',
      description: concept.description || '',
      category: concept.category || 'general',
      relevance: Math.max(0.1, Math.min(1.0, concept.relevance || 0.5)),
      relationship: concept.relationship || 'relates to',
    }));
  }

  public async searchSemanticallySimilar(
    query: string,
    existingConcepts: string[]
  ): Promise<string[]> {
    if (!this.isInitialized || !this.client) {
      throw new Error('OpenAI service not initialized');
    }

    try {
      const prompt = `Given the search query "${query}" and existing concepts [${existingConcepts.join(', ')}], 
      find the most semantically similar concepts from the existing list. 
      
      Respond with JSON: {"matches": ["concept1", "concept2", ...]}
      
      Rank by semantic similarity, return up to 10 matches.`;

      const response = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a semantic search engine. Respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.3,
        response_format: { type: 'json_object' }
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        return [];
      }

      const parsed = JSON.parse(content);
      return parsed.matches || [];
    } catch (error) {
      console.error('Semantic search failed:', error);
      return [];
    }
  }

  public async generateConceptDescription(concept: string): Promise<string> {
    if (!this.isInitialized || !this.client) {
      throw new Error('OpenAI service not initialized');
    }

    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a knowledge expert. Provide concise, informative descriptions of concepts.'
          },
          {
            role: 'user',
            content: `Provide a brief, informative description of the concept "${concept}" in 1-2 sentences.`
          }
        ],
        max_tokens: 150,
        temperature: 0.5,
      });

      return response.choices[0]?.message?.content || `Concept: ${concept}`;
    } catch (error) {
      console.error('Failed to generate concept description:', error);
      return `Concept: ${concept}`;
    }
  }

  private cleanCache(): void {
    const settings = useSettingsStore.getState().openai;
    const now = Date.now();
    
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > settings.cacheTimeout) {
        this.cache.delete(key);
      }
    }
  }

  public clearCache(): void {
    this.cache.clear();
  }

  public getCacheStats(): { size: number; oldestEntry: number } {
    let oldestTimestamp = Date.now();
    
    for (const value of this.cache.values()) {
      if (value.timestamp < oldestTimestamp) {
        oldestTimestamp = value.timestamp;
      }
    }
    
    return {
      size: this.cache.size,
      oldestEntry: oldestTimestamp,
    };
  }

  public updateApiKey(apiKey: string): void {
    if (this.client) {
      this.client = new OpenAI({
        apiKey,
        dangerouslyAllowBrowser: true,
      });
    }
  }

  public isReady(): boolean {
    return this.isInitialized && this.client !== null;
  }
}

export { OpenAIService };