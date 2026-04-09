## 1. Setup

- [ ] 1.1 Create `src/manage/tracking-metadata/` directory structure
- [ ] 1.2 Create DTO `TrackingMetadataQueryDto` with `businessLine?: string` and `eventType?: string`

## 2. Table Implementation

- [ ] 2.1 Create `TrackingMetadataTable` class extending `FeishuTable`
- [ ] 2.2 Configure `appToken = "C6ElwN9sHiLXdKka7g5c0iSinBe"` and `tableId = "tblZKbrIuV52FDo"`

## 3. Service Implementation

- [ ] 3.1 Create `TrackingMetadataService` with injected `TrackingMetadataTable`
- [ ] 3.2 Implement `search` method accepting `businessLine?: string`, `eventType?: string`
- [ ] 3.3 Return result of `this.table.searchTransformed({ businessLine, eventType })`

## 4. Controller Implementation

- [ ] 4.1 Create `TrackingMetadataController` with `GET /manage/tracking-metadata`
- [ ] 4.2 Add `@ApiTags('Tracking Metadata')`, `@ApiOperation({ summary: 'Get tracking metadata list' })`
- [ ] 4.3 Use `@Query()` to inject `TrackingMetadataQueryDto` and return service result
- [ ] 4.4 Add `@ApiOkResponse({ type: Array<TrackingMetadataDto> })`

## 5. Module Integration

- [ ] 5.1 Register `TrackingMetadataTable` and `TrackingMetadataService` in `ManageModule`
- [ ] 5.2 Register `TrackingMetadataController` in `ManageModule`

## 6. Verification

- [ ] 6.1 Run `pnpm lint` and fix any style issues
- [ ] 6.2 Verify Swagger docs show `/manage/tracking-metadata` endpoint with correct params and response
