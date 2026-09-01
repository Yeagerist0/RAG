import { RetrievalResult, RAGResponse } from "../../types/index.js";
import { OpenAI } from "openai";
import pino from "pino";

const logger = pino();

export class GenerationService {
  private openaiClient: OpenAI;
  private hallucinationThreshold: number = 0.6;

  constructor() {
    this.openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateAnswer(query: string, retrievedDocs: RetrievalResult[]): Promise<RAGResponse> {
    if (retrievedDocs.length === 0) {
      return {
        answer: "I apologize, but I don't have enough information in the provided documents to answer your question.",
        sources: [],
        confidence: 0,
        isHallucinated: true,
      };
    }

    const context = retrievedDocs
      .map(
        (doc, idx) =>
          `[Source ${idx + 1} - Page ${doc.chunk.metadata?.pageNumber || "N/A"}]:\n${doc.chunk.content}`
      )
      .join("\n\n");

    const systemPrompt = `You are a helpful AI assistant that answers questions based ONLY on the provided context.
    
Rules:
- Answer questions using ONLY the information provided in the context.
- If the context doesn't contain enough information to answer the question, say: "The provided documents do not contain enough information to answer this question."
- Always cite which source you're using for each fact.
- Do not make up, infer, or use general knowledge - only use what's in the context.
- Be concise and direct in your answers.

Context:
${context}`;

    try {
      const response = await this.openaiClient.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: query,
          },
        ],
        temperature: 0.3,
        max_tokens: 500,
      });

      const answer = response.choices[0].message.content || "";
      const confidence = this.calculateConfidence(answer, retrievedDocs);
      const isHallucinated = this.detectHallucination(answer, context);

      return {
        answer,
        sources: retrievedDocs.map((doc) => ({
          content: doc.chunk.content.substring(0, 300),
          source: doc.chunk.source,
          pageNumber: doc.chunk.metadata?.pageNumber,
        })),
        confidence,
        isHallucinated,
      };
    } catch (error) {
      logger.error(`Error generating answer: ${error}`);
      return {
        answer: "An error occurred while generating an answer. Please try again.",
        sources: [],
        confidence: 0,
        isHallucinated: false,
      };
    }
  }

  private calculateConfidence(answer: string, docs: RetrievalResult[]): number {
    const avgScore = docs.reduce((sum, doc) => sum + doc.score, 0) / docs.length;
    const answerLength = answer.length > 50 ? 1 : answer.length / 50;
    return Math.min(avgScore * answerLength, 1);
  }

  private detectHallucination(answer: string, context: string): boolean {
    const answerWords = answer.toLowerCase().split(/\s+/);
    const contextWords = context.toLowerCase();

    const unmatchedWords = answerWords.filter(
      (word) => word.length > 3 && !contextWords.includes(word)
    ).length;

    return unmatchedWords / answerWords.length > 0.3;
  }
}
