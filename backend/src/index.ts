import express, { Express, Request, Response } from "express";
import fileUpload from "express-fileupload";
import cors from "cors";
import dotenv from "dotenv";
import pino from "pino";

// Import services and controllers
import { EmbeddingService } from "./services/embedding/embeddingService.js";
import { RetrievalService } from "./services/retrieval/retrievalService.js";
import { CorrectiveRAG } from "./services/retrieval/correctiveRAG.js";
import { GenerationService } from "./services/generation/generationService.js";
import { UploadController } from "./controllers/uploadController.js";
import { ChatController } from "./controllers/chatController.js";

dotenv.config();

const logger = pino();
const app: Express = express();
const PORT = process.env.PORT || 5000;
const QDRANT_URL = process.env.QDRANT_URL || "http://localhost:6333";

// Middleware
app.use(cors());
app.use(express.json());
app.use(fileUpload());

// Initialize services
const embeddingService = new EmbeddingService(QDRANT_URL);
const retrievalService = new RetrievalService(embeddingService);
const correctiveRAG = new CorrectiveRAG(retrievalService);
const generationService = new GenerationService();

// Initialize controllers
const uploadController = new UploadController(embeddingService);
const chatController = new ChatController(retrievalService, correctiveRAG, generationService);

// Routes
app.post("/api/upload", (req, res) => uploadController.uploadDocument(req, res));
app.post("/api/chat", (req, res) => chatController.chat(req, res));

app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "ok", message: "RAG API is running" });
});

// Error handling middleware
app.use((error: any, req: Request, res: Response, next: any) => {
  logger.error(`Unhandled error: ${error}`);
  res.status(500).json({ error: "Internal server error" });
});

// Start server
app.listen(PORT, async () => {
  logger.info(`🚀 RAG Server running on port ${PORT}`);
  try {
    await embeddingService.ensureCollection();
    logger.info("✅ Qdrant collection ready");
  } catch (error) {
    logger.error(`Failed to initialize Qdrant: ${error}`);
  }
});

export default app;
