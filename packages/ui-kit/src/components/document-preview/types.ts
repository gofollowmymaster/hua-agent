export interface PreviewDocumentItem {
  fileName: string;
  fileType?: string;
}

export type LoadPreviewFile<Item extends PreviewDocumentItem> = (
  item: Item,
) => Promise<Blob | File>;
