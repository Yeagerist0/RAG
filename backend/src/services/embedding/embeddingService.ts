import { OpenAIEmbeddings } from "@langchain/openai";
import { Chunk, EmbeddingResult } from "../../types/index.js";
import { QdrantClient } from "@qdrant/js-client";
import pino from "pino";

const logger = pino();

export class EmbeddingService {
  private embeddings: OpenAIEmbeddings;
  private qdrantClient: QdrantClient;
  private collectionName: string;

  constructor(qdrantUrl: string = "http://localhost:6333", collectionName: string = "documents") {
    this.embeddings = new OpenAIEmbeddings({
      modelName: "text-embedding-3-small",
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.qdrantClient = new QdrantClient({
      url: qdrantUrl,
    });
    this.collectionName = collectionName;
  }

  async ensureCollection(): Promise<void> {
    try {
      await this.qdrantClient.getCollection(this.collectionName);
    } catch (error) {
      logger.info(`Creating collection: ${this.collectionName}`);
      await this.qdrantClient.createCollection(this.collectionName, {
        vectors: {
          size: 1536,
          distance: "Cosine",
        },
      });
    }
  }

  async embedChunks(chunks: Chunk[]): Promise<EmbeddingResult[]> {
    const results: EmbeddingResult[] = [];

    for (const chunk of chunks) {
      try {
        const embedding = await this.embeddings.embedQuery(chunk.content);
        results.push({
          chunkId: chunk.id,
          embedding,
          content: chunk.content,
          source: chunk.source,
        });
      } catch (error) {
        logger.error(`Failed to embed chunk ${chunk.id}: ${error}`);
      }
    }

    return results;
  }

  async storeEmbeddings(chunks: Chunk[], embeddings: EmbeddingResult[]): Promise<void> {
    await this.ensureCollection();

    const points = embeddings.map((result, index) => ({
      id: Math.floor(Math.random() * 1000000000),
      vector: result.embedding,
      payload: {
        chunkId: result.chunkId,
        content: result.content,
        source: result.source,
        documentId: chunks[index]?.documentId,
        chunkIndex: chunks[index]?.chunkIndex,
        metadata: chunks[index]?.metadata,
      },
    }));

    await this.qdrantClient.upsert(this.collectionName, {
      points,
    });

    logger.info(`Stored ${points.length} embeddings in Qdrant`);
  }

  async searchSimilar(query: string, topK: number = 3): Promise<any[]> {
    const queryEmbedding = await this.embeddings.embedQuery(query);

    const searchResult = await this.qdrantClient.search(this.collectionName, {
      vector: queryEmbedding,
      limit: topK,
      with_payload: true,
    });

    return searchResult;
  }
}
