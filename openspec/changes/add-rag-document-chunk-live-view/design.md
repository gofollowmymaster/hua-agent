# Design

## Backend

Add `POST /ai/rag/admin/documents/:id/chunks/page` to `RagAdminController`, guarded by the existing `AuthGuard`.

`RagAdminService.pageDocumentChunks(id, params)` will:

- Resolve current tenant using the existing tenant fallback.
- Confirm the document exists and belongs to that tenant.
- Count and page `aplusChunk` rows by `tenantCode` and `documentId`.
- Sort by `chunkIndex asc`.
- Return the existing page shape: `{ list, total, page, pageSize }`.
- Serialize all BigInt values before returning.

## Frontend

Add `pageDocumentChunks(id, params)` and `RagDocumentChunkItem` in the RAG Admin API client.

In `DocumentManager.vue`, add a "切片实况" link action. The action opens a right-side drawer with selected document summary, loading/error/empty states, a chunk list, and pagination. Metadata is displayed as formatted JSON.

## Constraints

- The live view reflects database state only.
- No embedding vector values are returned.
- No shared package type is needed for this local admin contract.
