import { RetrievalResult, Chunk } from "../../types/index.js";
import { EmbeddingService } from "../embedding/embeddingService.js";
import pino from "pino";

const logger = pino();

export class RetrievalService {
  private embeddingService: EmbeddingService;
  private similarityThreshold: number = 0.5;

  constructor(embeddingService: EmbeddingService) {
    this.embeddingService = embeddingService;
  }

  async retrieve(query: string, topK: number = 5): Promise<RetrievalResult[]> {
    try {
      const searchResults = await this.embeddingService.searchSimilar(query, topK);

      const results: RetrievalResult[] = searchResults.map((result: any) => ({
        chunk: {
          id: result.payload.chunkId,
          content: result.payload.content,
          documentId: result.payload.documentId,
          chunkIndex: result.payload.chunkIndex,
          source: result.payload.source,
          metadata: result.payload.metadata || {},
        },
        score: result.score,
        relevance: this.scoreToRelevance(result.score),
        embedding: result.vector,
      }));

      return results.filter((r) => r.score >= this.similarityThreshold);
    } catch (error) {
      logger.error(`Retrieval error: ${error}`);
      return [];
    }
  }

  private scoreToRelevance(score: number): "high" | "medium" | "low" {
    if (score >= 0.8) return "high";
    if (score >= 0.6) return "medium";
    return "low";
  }

  async retrieveWithReranking(query: string, topK: number = 10): Promise<RetrievalResult[]> {
    // First pass: retrieve more documents
    const initialResults = await this.retrieve(query, topK * 2);

    // Rerank based on relevance and query alignment
    const reranked = initialResults.sort((a, b) => {
      const aScore = this.calculateRelevanceScore(query, a.chunk.content);
      const bScore = this.calculateRelevanceScore(query, b.chunk.content);
      return bScore - aScore;
    });

    return reranked.slice(0, topK);
  }

  private calculateRelevanceScore(query: string, content: string): number {
    const queryWords = query.toLowerCase().split(/\s+/);
    const contentLower = content.toLowerCase();

    const matchedWords = queryWords.filter((word) => contentLower.includes(word)).length;
    return matchedWords / queryWords.length;
  }
}
