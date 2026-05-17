export interface Document {
  id: string;
  content: string;
  metadata: Record<string, any>;
  source: string;
  pageNumber?: number;
}

export interface Chunk {
  id: string;
  content: string;
  documentId: string;
  chunkIndex: number;
  source: string;
  metadata: Record<string, any>;
}

export interface EmbeddingResult {
  chunkId: string;
  embedding: number[];
  content: string;
  source: string;
}

export interface RetrievalResult {
  chunk: Chunk;
  score: number;
  relevance: "high" | "medium" | "low";
  embedding: number[];
}

export interface RAGResponse {
  answer: string;
  sources: Array<{
    content: string;
    source: string;
    pageNumber?: number;
  }>;
  confidence: number;
  isHallucinated: boolean;
}

export interface CorrectiveRAGResult {
  originalQuery: string;
  rewrittenQuery?: string;
  retrievedDocs: RetrievalResult[];
  gradedRelevance: Map<string, boolean>;
  fallbackUsed: boolean;
  answer: string;
}

export interface ChunkingConfig {
  strategy: "semantic" | "sliding-window" | "max-tokens";
  chunkSize: number;
  overlap: number;
  separator?: string;
}
