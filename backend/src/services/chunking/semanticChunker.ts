import { Chunk } from "../../types/index.js";
import { v4 as uuidv4 } from "uuid";

export class SemanticChunker {
  private targetChunkSize: number;
  private sentenceWindow: number;

  constructor(targetChunkSize: number = 600, sentenceWindow: number = 3) {
    this.targetChunkSize = targetChunkSize;
    this.sentenceWindow = sentenceWindow;
  }

  private splitIntoSentences(text: string): string[] {
    const sentenceRegex = /[^.!?]+[.!?]+/g;
    const sentences = text.match(sentenceRegex) || [];
    return sentences.map((s) => s.trim()).filter((s) => s.length > 0);
  }

  chunk(
    content: string,
    documentId: string,
    source: string,
    metadata: Record<string, any> = {}
  ): Chunk[] {
    const sentences = this.splitIntoSentences(content);
    const chunks: Chunk[] = [];
    let chunkIndex = 0;

    for (let i = 0; i < sentences.length; i += this.sentenceWindow) {
      const sentenceWindow = sentences.slice(i, i + this.sentenceWindow);
      const chunkContent = sentenceWindow.join(" ").trim();

      if (chunkContent.length > 0) {
        chunks.push({
          id: uuidv4(),
          content: chunkContent,
          documentId,
          chunkIndex,
          source,
          metadata,
        });
        chunkIndex++;
      }
    }

    return chunks;
  }
}
