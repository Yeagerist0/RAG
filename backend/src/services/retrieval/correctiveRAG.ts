import { CorrectiveRAGResult, RetrievalResult } from "../../types/index.js";
import { RetrievalService } from "./retrievalService.js";
import { OpenAI } from "openai";
import pino from "pino";

const logger = pino();

export class CorrectiveRAG {
  private retrievalService: RetrievalService;
  private openaiClient: OpenAI;
  private relevanceThreshold: number = 0.5;

  constructor(retrievalService: RetrievalService) {
    this.retrievalService = retrievalService;
    this.openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async process(query: string): Promise<CorrectiveRAGResult> {
    logger.info(`Processing corrective RAG for query: ${query}`);

    // Step 1: Retrieve documents
    let retrievedDocs = await this.retrievalService.retrieve(query, 5);
    logger.info(`Retrieved ${retrievedDocs.length} documents`);

    // Step 2: Grade relevance of retrieved documents
    const gradedRelevance = await this.gradeRelevance(query, retrievedDocs);
    const relevantDocs = retrievedDocs.filter((doc) => gradedRelevance.get(doc.chunk.id));

    logger.info(`Graded ${relevantDocs.length} documents as relevant`);

    let finalDocs = relevantDocs;
    let fallbackUsed = false;

    // Step 3: If insufficient relevant documents, rewrite query and retrieve again
    if (relevantDocs.length < 2) {
      logger.warn(`Insufficient relevant documents (${relevantDocs.length}). Rewriting query...`);
      const rewrittenQuery = await this.rewriteQuery(query);
      logger.info(`Rewritten query: ${rewrittenQuery}`);

      const newResults = await this.retrievalService.retrieve(rewrittenQuery, 5);
      const newGraded = await this.gradeRelevance(rewrittenQuery, newResults);
      finalDocs = newResults.filter((doc) => newGraded.get(doc.chunk.id));

      if (finalDocs.length > 0) {
        retrievedDocs = finalDocs;
        logger.info(`Retrieved ${finalDocs.length} documents with rewritten query`);
      } else {
        // Fallback: use best available documents
        fallbackUsed = true;
        finalDocs = retrievedDocs.slice(0, 3);
        logger.warn("Using fallback documents due to low relevance");
      }
    }

    return {
      originalQuery: query,
      retrievedDocs: finalDocs,
      gradedRelevance,
      fallbackUsed,
      answer: "", // Will be filled by generation service
    };
  }

  private async gradeRelevance(query: string, docs: RetrievalResult[]): Promise<Map<string, boolean>> {
    const gradedMap = new Map<string, boolean>();

    for (const doc of docs) {
      try {
        const response = await this.openaiClient.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `You are a relevance grader. Determine if the given document is relevant to answer the query. 
              Respond with ONLY "yes" or "no".`,
            },
            {
              role: "user",
              content: `Query: ${query}\n\nDocument: ${doc.chunk.content.substring(0, 500)}`,
            },
          ],
          temperature: 0,
          max_tokens: 10,
        });

        const verdict = response.choices[0].message.content?.toLowerCase().includes("yes") ?? false;
        gradedMap.set(doc.chunk.id, verdict);
        logger.debug(`Graded document ${doc.chunk.id}: ${verdict ? "relevant" : "not relevant"}`);
      } catch (error) {
        logger.error(`Error grading document: ${error}`);
        gradedMap.set(doc.chunk.id, doc.score >= this.relevanceThreshold);
      }
    }

    return gradedMap;
  }

  private async rewriteQuery(query: string): Promise<string> {
    try {
      const response = await this.openaiClient.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a query rewriter. Rewrite the user's query to be more specific and search-friendly.
            Return ONLY the rewritten query, no explanation.`,
          },
          {
            role: "user",
            content: query,
          },
        ],
        temperature: 0,
        max_tokens: 100,
      });

      return response.choices[0].message.content || query;
    } catch (error) {
      logger.error(`Error rewriting query: ${error}`);
      return query;
    }
  }
}
