import { Request, Response } from "express";
import { UploadedFile, FileArray } from "express-fileupload";
import { FileParser } from "../utils/fileParser.js";
import { ChunkingService } from "../services/chunking/index.js";
import { EmbeddingService } from "../services/embedding/embeddingService.js";
import pino from "pino";

const logger = pino();

export class UploadController {
  private fileParser: FileParser;
  private chunkingService: ChunkingService;
  private embeddingService: EmbeddingService;

  constructor(embeddingService: EmbeddingService) {
    this.fileParser = new FileParser();
    this.chunkingService = new ChunkingService({
      strategy: "sliding-window",
      chunkSize: 600,
      overlap: 120,
    });
    this.embeddingService = embeddingService;
  }

  async uploadDocument(req: Request, res: Response): Promise<void> {
    try {
      const files = req.files as FileArray | undefined;

      if (!files || !files.file) {
        res.status(400).json({ error: "No file provided" });
        return;
      }

      const file = files.file as UploadedFile;
      const tempPath = `/tmp/${Date.now()}-${file.name}`;

      // Save file temporarily
      await file.mv(tempPath);

      // Parse file
      const doc = await this.fileParser.parseFile(tempPath);
      logger.info(`Parsed document: ${doc.source}`);

      // Chunk document
      const chunks = this.chunkingService.chunk(doc.content, doc.id, doc.source, "sliding-window", doc.metadata);
      logger.info(`Created ${chunks.length} chunks`);

      // Embed chunks
      const embeddings = await this.embeddingService.embedChunks(chunks);
      logger.info(`Generated ${embeddings.length} embeddings`);

      // Store in Qdrant
      await this.embeddingService.storeEmbeddings(chunks, embeddings);

      // Clean up temp file
      const fs = await import("fs/promises");
      await fs.unlink(tempPath);

      res.json({
        success: true,
        message: "Document processed successfully",
        data: {
          documentId: doc.id,
          fileName: doc.source,
          chunksCreated: chunks.length,
          embeddingsStored: embeddings.length,
        },
      });
    } catch (error) {
      logger.error(`Upload error: ${error}`);
      res.status(500).json({ error: `Upload failed: ${error}` });
    }
  }
}
