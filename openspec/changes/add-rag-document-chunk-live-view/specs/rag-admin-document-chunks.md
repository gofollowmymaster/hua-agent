# RAG Admin Document Chunks

## Requirements

### Requirement: Page indexed document chunks

The system shall provide a RAG Admin endpoint to page through the currently indexed chunks for a selected document.

#### Scenario: Current tenant document

- Given a document belongs to the current tenant
- When the admin requests its chunk page
- Then the response contains chunks for that document ordered by `chunkIndex asc`
- And each item includes `id`, `documentId`, `chunkIndex`, `content`, `metadata`, and `createdAt`
- And the response includes `total`, `page`, and `pageSize`

#### Scenario: Cross-tenant or missing document

- Given the requested document does not exist or belongs to another tenant
- When the admin requests its chunk page
- Then the request fails with the existing document-not-found error semantics

### Requirement: View chunk live data in document list

The RAG Admin document management list shall let an admin view a selected document's indexed chunks without leaving the list page.

#### Scenario: Open live view

- Given the admin is on the document management list
- When the admin clicks "切片实况"
- Then a right-side drawer opens
- And it shows the document summary and the first page of indexed chunks

#### Scenario: Empty or failed load

- Given the selected document has no chunks or the chunk request fails
- When the drawer finishes loading
- Then the drawer shows a clear empty or error state without closing the document list
