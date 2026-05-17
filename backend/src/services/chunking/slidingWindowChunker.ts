import { Chunk } from "../../types/index.js";
import { v4 as uuidv4 } from "uuid";

export class SlidingWindowChunker {
  private chunkSize: number;
  private overlap: number;
  private separator: string;

  constructor(chunkSize: number = 600, overlap: number = 120, separator: string = "\n") {
    this.chunkSize = chunkSize;
    this.overlap = overlap;
    this.separator = separator;
  }

  chunk(
    content: string,
    documentId: string,
    source: string,
    metadata: Record<string, any> = {}
  ): Chunk[] {
    if (!content || content.length === 0) {
      return [];
    }

    const chunks: Chunk[] = [];
    let currentIndex = 0;
    let chunkIndex = 0;

    while (currentIndex < content.length) {
      const endIndex = Math.min(currentIndex + this.chunkSize, content.length);
      let chunkContent = content.substring(currentIndex, endIndex);

      // Try to break at a sentence boundary if possible
      if (endIndex < content.length) {
        const lastNewline = chunkContent.lastIndexOf(this.separator);
        if (lastNewline > this.chunkSize * 0.7) {
          const chunkEnd = currentIndex + lastNewline;
          chunkContent = content.substring(currentIndex, chunkEnd);
          currentIndex = chunkEnd + this.separator.length;
        } else {
          currentIndex = endIndex;
        }
      } else {
        currentIndex = endIndex;
      }

      chunks.push({
        id: uuidv4(),
        content: chunkContent.trim(),
        documentId,
        chunkIndex,
        source,
        metadata,
      });

      // Move back by overlap for next iteration
      currentIndex = Math.max(currentIndex - this.overlap, 0);
      chunkIndex++;

      if (chunks.length > 10000) break; // Safety limit
    }

    return chunks;
  }
}
