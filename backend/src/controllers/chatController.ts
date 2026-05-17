import { Request, Response } from "express";
import { RetrievalService } from "../services/retrieval/retrievalService.js";
import { CorrectiveRAG } from "../services/retrieval/correctiveRAG.js";
import { GenerationService } from "../services/generation/generationService.js";
import pino from "pino";

const logger = pino();

export class ChatController {
  private retrievalService: RetrievalService;
  private correctiveRAG: CorrectiveRAG;
  private generationService: GenerationService;

  constructor(
    retrievalService: RetrievalService,
    correctiveRAG: CorrectiveRAG,
    generationService: GenerationService
  ) {
    this.retrievalService = retrievalService;
    this.correctiveRAG = correctiveRAG;
    this.generationService = generationService;
  }

  async chat(req: Request, res: Response): Promise<void> {
    try {
      const { query, useCorrectiveRAG = true } = req.body;

      if (!query) {
        res.status(400).json({ error: "Query is required" });
        return;
      }

      logger.info(`Processing query: ${query}`);

      let retrievedDocs: any[] = [];
      let fallbackUsed = false;

      if (useCorrectiveRAG) {
        const result = await this.correctiveRAG.process(query);
        retrievedDocs = result.retrievedDocs;
        fallbackUsed = result.fallbackUsed;
      } else {
        retrievedDocs = await this.retrievalService.retrieve(query, 5);
      }

      // Generate answer
      const response = await this.generationService.generateAnswer(query, retrievedDocs);

      res.json({
        success: true,
        data: {
          query,
          answer: response.answer,
          sources: response.sources,
          confidence: response.confidence,
          isHallucinated: response.isHallucinated,
          fallbackUsed,
          documentsRetrieved: retrievedDocs.length,
        },
      });
    } catch (error) {
      logger.error(`Chat error: ${error}`);
      res.status(500).json({ error: `Chat failed: ${error}` });
    }
  }
}
