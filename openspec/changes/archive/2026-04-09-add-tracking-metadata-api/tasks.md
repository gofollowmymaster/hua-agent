## 1. Setup

- [x] 1.1 Create `src/manage/tracking-metadata/` directory structure
- [x] 1.2 Create DTO `TrackingMetadataQueryDto` with `businessLine?: string` and `eventType?: string`

## 2. Table Implementation

- [x] 2.1 Create `TrackingMetadataTable` class extending `FeishuTable`
- [x] 2.2 Configure `appToken = "C6ElwN9sHiLXdKka7g5c0iSinBe"` and `tableId = "tblZKbrIuV52FDo"`

## 3. Service Implementation

- [x] 3.1 Create `TrackingMetadataService` with injected `TrackingMetadataTable`
- [x] 3.2 Implement `search` method accepting `businessLine?: string`, `eventType?: string`
- [x] 3.3 Return result of `this.table.searchTransformed({ businessLine, eventType })`

## 4. Controller Implementation

- [x] 4.1 Create `TrackingMetadataController` with `GET /manage/tracking-metadata`
- [x] 4.2 Add `@ApiTags('Tracking Metadata')`, `@ApiOperation({ summary: 'Get tracking metadata list' })`
- [x] 4.3 Use `@Query()` to inject `TrackingMetadataQueryDto` and return service result
- [x] 4.4 Add `@ApiOkResponse({ type: TrackingMetadataListDto })`

## 5. Module Integration

- [x] 5.1 Register `TrackingMetadataTable` and `TrackingMetadataService` in `ManageModule`
- [x] 5.2 Register `TrackingMetadataController` in `ManageModule`

## 6. Verification

- [x] 6.1 Run `pnpm lint` and fix any style issues
- [x] 6.2 Verify Swagger docs show `/manage/tracking-metadata` endpoint with correct params and response
