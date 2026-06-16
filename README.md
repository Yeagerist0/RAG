# Corrective RAG

Document question-answering that re-retrieves instead of guessing. A grader model scores the retrieved chunks against the question, and if they don't actually answer it, the query gets rewritten and searched again before anything is generated. Built to see how much of the hallucination problem is really a retrieval problem.

## How the pipeline works

```
query
  → retrieve top-k chunks (Qdrant, cosine)
  → grade each chunk for relevance (LLM)
  → enough relevant chunks?
        yes → generate
        no  → rewrite the query, retrieve again → generate
  → answer + source chunks + confidence
```

The generation step is given the retrieved chunks and told to answer from them only, so an unanswerable question comes back as unanswerable rather than as fluent invention.

## Stack

Express and TypeScript on the backend, React and Vite with Tailwind on the front end, Qdrant for vectors, OpenAI for embeddings and generation. Everything except the OpenAI calls runs locally under Docker Compose.

## Chunking

Two strategies, both targeting 600 characters:

- **Sliding window** — 600-character chunks with 120 characters of overlap (20%), split on newlines and backing off to sentence boundaries where it can. The default.
- **Semantic** — groups whole sentences in a 3-sentence window, so chunks break where the text breaks rather than at a character count.

Embeddings are `text-embedding-3-small`; retrieval returns the top 3 by cosine similarity. There's also a reranking path that pulls 2× the requested chunks and re-scores them before slicing back down.

## Running it

You need Docker and an OpenAI API key.

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# add OPENAI_API_KEY to backend/.env

docker compose up
```

Frontend on :3000, backend on :5000, Qdrant on :6333.

## API

**`POST /api/upload`** — multipart file upload, PDF or TXT. Parses, chunks, embeds and stores; returns the document id and how many chunks were created.

**`POST /api/chat`**

```json
{ "query": "What is the main topic?", "useCorrectiveRAG": true }
```

Returns the answer, the source chunks it used (with filename and page), a confidence score, and flags for whether the corrective fallback fired. Set `useCorrectiveRAG` to `false` to get plain retrieve-then-generate, which is the useful comparison.

## Layout

```
backend/src/services/
  chunking/     sliding-window and semantic splitters
  embedding/    OpenAI embeddings + Qdrant client
  retrieval/    search, reranking, corrective loop
  generation/   grounded answer generation
frontend/src/components/
  DocumentUpload.tsx
  Chat.tsx
```

## Status

A working prototype, not a product. There are no tests yet, and the latency numbers that used to be in this file were never measured, so they're gone.
