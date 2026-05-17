import { Document } from "../types/index.js";
import * as fs from "fs/promises";
import * as path from "path";
import pdf from "pdf-parse";
import pino from "pino";

const logger = pino();

export class FileParser {
  async parsePDF(filePath: string): Promise<string> {
    try {
      const dataBuffer = await fs.readFile(filePath);
      const data = await pdf(dataBuffer);
      return data.text;
    } catch (error) {
      logger.error(`Error parsing PDF: ${error}`);
      throw new Error(`Failed to parse PDF: ${error}`);
    }
  }

  async parseTXT(filePath: string): Promise<string> {
    try {
      const content = await fs.readFile(filePath, "utf-8");
      return content;
    } catch (error) {
      logger.error(`Error parsing TXT: ${error}`);
      throw new Error(`Failed to parse TXT: ${error}`);
    }
  }

  async parseFile(filePath: string): Promise<Document> {
    const ext = path.extname(filePath).toLowerCase();
    let content = "";

    if (ext === ".pdf") {
      content = await this.parsePDF(filePath);
    } else if (ext === ".txt") {
      content = await this.parseTXT(filePath);
    } else {
      throw new Error(`Unsupported file format: ${ext}`);
    }

    return {
      id: `doc-${Date.now()}`,
      content,
      metadata: {
        fileName: path.basename(filePath),
        fileSize: (await fs.stat(filePath)).size,
        uploadedAt: new Date().toISOString(),
      },
      source: path.basename(filePath),
    };
  }
}
