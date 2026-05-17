import { Chunk, ChunkingConfig } from "../../types/index.js";
import { SlidingWindowChunker } from "./slidingWindowChunker.js";
import { SemanticChunker } from "./semanticChunker.js";

export class ChunkingService {
  private slidingWindowChunker: SlidingWindowChunker;
  private semanticChunker: SemanticChunker;

  constructor(config: ChunkingConfig = { strategy: "sliding-window", chunkSize: 600, overlap: 120 }) {
    this.slidingWindowChunker = new SlidingWindowChunker(config.chunkSize, config.overlap);
    this.semanticChunker = new SemanticChunker(config.chunkSize);
  }

  chunk(
    content: string,
    documentId: string,
    source: string,
    strategy: "semantic" | "sliding-window" = "sliding-window",
    metadata: Record<string, any> = {}
  ): Chunk[] {
    switch (strategy) {
      case "semantic":
        return this.semanticChunker.chunk(content, documentId, source, metadata);
      case "sliding-window":
      default:
        return this.slidingWindowChunker.chunk(content, documentId, source, metadata);
    }
  }
}

export { SlidingWindowChunker, SemanticChunker };
