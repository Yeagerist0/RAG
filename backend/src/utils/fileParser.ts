import { Document } from "../types/index.js";
import * as fs from "fs/promises";
import os from "os";
import * as path from "path";
import pdf from "pdf-parse";
import pino from "pino";

const logger = pino();

export class FileParser {
  private readonly uploadRoot = path.resolve(process.env.UPLOAD_DIR || os.tmpdir());

  private getSafePath(filePath: string): string {
    const resolvedPath = path.resolve(filePath);
    const isWithinUploadRoot = resolvedPath === this.uploadRoot || resolvedPath.startsWith(`${this.uploadRoot}${path.sep}`);

    if (!isWithinUploadRoot) {
      throw new Error("Invalid file path");
    }

    return resolvedPath;
  }

  async parsePDF(filePath: string): Promise<string> {
    try {
      const safePath = this.getSafePath(filePath);
      const dataBuffer = await fs.readFile(safePath);
      const data = await pdf(dataBuffer);
      return data.text;
    } catch (error) {
      logger.error(`Error parsing PDF: ${error}`);
      throw new Error(`Failed to parse PDF: ${error}`);
    }
  }

  async parseTXT(filePath: string): Promise<string> {
    try {
      const safePath = this.getSafePath(filePath);
      const content = await fs.readFile(safePath, "utf-8");
      return content;
    } catch (error) {
      logger.error(`Error parsing TXT: ${error}`);
      throw new Error(`Failed to parse TXT: ${error}`);
    }
  }

  async parseFile(filePath: string): Promise<Document> {
    const safePath = this.getSafePath(filePath);
    const ext = path.extname(safePath).toLowerCase();
    let content = "";

    if (ext === ".pdf") {
      content = await this.parsePDF(safePath);
    } else if (ext === ".txt") {
      content = await this.parseTXT(safePath);
    } else {
      throw new Error(`Unsupported file format: ${ext}`);
    }

    return {
      id: `doc-${Date.now()}`,
      content,
      metadata: {
        fileName: path.basename(safePath),
        fileSize: (await fs.stat(safePath)).size,
        uploadedAt: new Date().toISOString(),
      },
      source: path.basename(safePath),
    };
  }
}
