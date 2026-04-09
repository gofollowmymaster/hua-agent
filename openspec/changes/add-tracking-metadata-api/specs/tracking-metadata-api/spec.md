## ADDED Requirements

### Requirement: Get tracking metadata list

The system SHALL provide a GET endpoint to retrieve tracking metadata from Feishu bitable with support for filtering.

#### Scenario: Get all tracking metadata without filters

- **WHEN** client sends GET request to `/manage/tracking-metadata` without query parameters
- **THEN** system returns all tracking metadata records from Feishu bitable

#### Scenario: Filter by business line

- **WHEN** client sends GET request with `businessLine` query parameter
- **THEN** system returns only records matching the specified business line

#### Scenario: Filter by event type

- **WHEN** client sends GET request with `eventType` query parameter
- **THEN** system returns only records matching the specified event type

#### Scenario: Combined filters

- **WHEN** client sends GET request with both `businessLine` and `eventType` query parameters
- **THEN** system returns records matching both filters

### Requirement: Response structure

The endpoint SHALL return tracking metadata with event name, event ID, and event type.

#### Scenario: Successful response format

- **WHEN** request is successful
- **THEN** system returns JSON with `code: 200`, `data` containing array of tracking metadata objects with keys `eventName`, `eventId`, `eventType`

### Requirement: Swagger documentation

The endpoint SHALL have complete Swagger documentation including summary, description, and response schemas.

#### Scenario: API documentation available

- **WHEN** Swagger UI is accessed in dev environment
- **THEN** the tracking metadata endpoint is documented with all parameters and response types
