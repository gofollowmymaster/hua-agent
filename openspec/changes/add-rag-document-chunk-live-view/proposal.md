# Add RAG Document Chunk Live View

## What

Add a RAG Admin document-list action that opens a right-side drawer showing the currently indexed chunks for a selected document.

## Why

Operators can see document chunk counts today, but cannot inspect the actual indexed content used by retrieval. This makes it hard to verify ingestion quality, diagnose missing context, or confirm metadata such as page/source information.

## Scope

- Add a tenant-scoped admin API to page through `aplus_chunks` for one document.
- Add front-end API types and a document-list drawer for chunk live view.
- Show chunk index, content, metadata, and created time.
- Do not re-parse source files, expose embedding vectors, or change the database schema.
