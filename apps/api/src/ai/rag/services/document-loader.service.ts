import { BadRequestException, Injectable } from '@nestjs/common';
import type { Document } from '@langchain/core/documents';
import { DocxLoader } from '@langchain/community/document_loaders/fs/docx';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { PPTXLoader } from '@langchain/community/document_loaders/fs/pptx';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import xlsx from 'xlsx';
import { TenantCode } from '@src/config/tenant';
import { NodeConfigService } from '@src/config/node-config.service';
import type {
  LoadedDocument,
  LoadedSegment,
  RawDocumentFile,
} from '../types/rag.type';

const IGNORED_NAMES = new Set(['.DS_Store', '.WeDrive']);
const SUPPORTED_EXTENSIONS = new Set([
  '.pdf',
  '.docx',
  '.xlsx',
  '.ppt',
  '.pptx',
  '.txt',
  '.md',
]);

@Injectable()
export class DocumentLoaderService {
  private readonly rawDir: string;

  constructor() {
    this.rawDir = path.resolve(
      process.cwd(),
      NodeConfigService.get('vcHelper').rawDir,
    );
  }

  async scanRawFiles(tenantCode: TenantCode): Promise<RawDocumentFile[]> {
    const tenantRawDir = path.join(this.rawDir, tenantCode);
    const absolutePaths = await this.walk(tenantRawDir);
    const files: RawDocumentFile[] = [];

    for (const absolutePath of absolutePaths) {
      const ext = path.extname(absolutePath).toLowerCase();
      if (!SUPPORTED_EXTENSIONS.has(ext)) continue;

      const stat = await fs.stat(absolutePath);
      const sourcePath = path.relative(tenantRawDir, absolutePath);
      files.push({
        absolutePath,
        sourcePath,
        fileName: path.basename(absolutePath),
        fileType: ext.slice(1),
        fileSize: stat.size,
        fileHash: await this.hashFile(absolutePath),
      });
    }

    return files;
  }

  async loadDocument(file: RawDocumentFile): Promise<LoadedDocument> {
    const ext = path.extname(file.absolutePath).toLowerCase();
    let segments: LoadedSegment[];

    if (ext === '.pdf') {
      segments = await this.loadPdf(file.absolutePath);
    } else if (ext === '.docx') {
      segments = await this.loadDocx(file.absolutePath);
    } else if (ext === '.xlsx') {
      segments = await this.loadXlsx(file.absolutePath);
    } else if (ext === '.pptx') {
      segments = await this.loadPptx(file.absolutePath);
    } else if (ext === '.ppt') {
      segments = await this.loadLegacyPpt(file.absolutePath);
    } else if (ext === '.txt' || ext === '.md') {
      segments = await this.loadText(file.absolutePath);
    } else {
      throw new BadRequestException(`Unsupported file type: ${ext}`);
    }

    return {
      ...file,
      segments: segments.filter((segment) => segment.text.trim().length > 0),
    };
  }

  private async walk(dir: string): Promise<string[]> {
    let entries: Awaited<ReturnType<typeof fs.readdir>>;
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return [];
      }
      throw error;
    }
    const files: string[] = [];

    for (const entry of entries) {
      if (IGNORED_NAMES.has(entry.name)) continue;

      const absolutePath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...(await this.walk(absolutePath)));
      } else if (entry.isFile()) {
        files.push(absolutePath);
      }
    }

    return files;
  }

  private async hashFile(filePath: string): Promise<string> {
    const file = await fs.readFile(filePath);
    return crypto.createHash('sha256').update(file).digest('hex');
  }

  private async loadPdf(filePath: string): Promise<LoadedSegment[]> {
    const loader = new PDFLoader(filePath, {
      splitPages: true,
      parsedItemSeparator: '',
    });
    const documents = await loader.load();

    return this.mapLangchainDocuments(documents, (document) =>
      this.normalizePdfText(document.pageContent),
    );
  }

  private normalizePdfText(text: string): string {
    let normalized = this.compactSingleCharacterLineBlocks(
      text.replace(/\r\n/g, '\n'),
    )
      .replace(/\b(?:[A-Za-z][ \t]+)+[A-Za-z]\b/g, (value) =>
        value.replace(/[ \t]+/g, ''),
      )
      .replace(/\b(?:[0-9][ \t]+)+[0-9]\b/g, (value) =>
        value.replace(/[ \t]+/g, ''),
      )
      .replace(/([A-Za-z0-9])\s+([./%+~$])/g, '$1$2')
      .replace(/([./%+~$])\s+(?=[A-Za-z0-9])/g, '$1')
      .replace(/[ \t]*([≤≥<>＝=])[ \t]*/g, '$1')
      .replace(/([\u4e00-\u9fa5A-Za-z0-9])\s+([（(【\[])/g, '$1$2')
      .replace(/[ \t]+([）)】\]，。；：、！？])/g, '$1')
      .replace(/([（(【\[])[ \t]+/g, '$1')
      .replace(/([）)】\]])\s+(?=[\u4e00-\u9fa5A-Za-z0-9])/g, '$1')
      .replace(/([，。；：、！？])[ \t]+(?=[\u4e00-\u9fa5A-Za-z0-9])/g, '$1')
      .replace(/([\u4e00-\u9fa5A-Za-z0-9])\s+([+])(?=[0-9])/g, '$1$2')
      .replace(/([0-9])\s+([wW万年月日周天个件分])/g, '$1$2')
      .replace(/([0-9wW万%])\s+(?=[美分])/g, '$1')
      .replace(/([\u4e00-\u9fa5])[ \t]+(?=[0-9])/g, '$1')
      .replace(/([\u4e00-\u9fa5])[ \t]+(?=[\u4e00-\u9fa5])/g, '$1')
      .replace(/[ \t\f\v]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    const compactTokens = [
      'ASIN',
      'ASP',
      'FBA',
      'GMV',
      'KPI',
      'MSRP',
      'SC',
      'VC',
      'VRP',
      'listing',
      'offer',
      'reviews',
    ];
    for (const token of compactTokens) {
      normalized = normalized
        .replace(
          new RegExp(`([\\u4e00-\\u9fa50-9]) ${token}`, 'g'),
          `$1${token}`,
        )
        .replace(new RegExp(`${token} (?=[\\u4e00-\\u9fa50-9])`, 'g'), token);
    }

    return normalized;
  }

  private compactSingleCharacterLineBlocks(text: string): string {
    const pageLines = text.split('\n').map((line) => line.trim());
    const pageContentLines = pageLines.filter(Boolean);
    if (this.isSingleCharacterLineDominant(pageContentLines)) {
      return pageContentLines.join('');
    }

    return text
      .split(/\n{2,}/)
      .map((block) => {
        const lines = block.split('\n');
        const contentLines = lines.map((line) => line.trim()).filter(Boolean);
        return this.isSingleCharacterLineDominant(contentLines)
          ? contentLines.join('')
          : block;
      })
      .join('\n\n');
  }

  private isSingleCharacterLineDominant(lines: string[]): boolean {
    if (lines.length < 6) return false;

    const lengths = lines.map((line) => Array.from(line).length);
    const singleCharacterLines = lengths.filter((length) => length === 1);
    const shortLines = lengths.filter((length) => length <= 2);
    const averageLength =
      lengths.reduce((sum, length) => sum + length, 0) / lengths.length;

    return (
      singleCharacterLines.length / lines.length >= 0.65 ||
      (shortLines.length / lines.length >= 0.8 && averageLength <= 2.5)
    );
  }

  private async loadDocx(filePath: string): Promise<LoadedSegment[]> {
    const loader = new DocxLoader(filePath);
    return this.mapLangchainDocuments(await loader.load());
  }

  private async loadXlsx(filePath: string): Promise<LoadedSegment[]> {
    const workbook = xlsx.readFile(filePath, { cellDates: true });
    return workbook.SheetNames.map((sheetName) => {
      const sheet = workbook.Sheets[sheetName];
      const rows = xlsx.utils.sheet_to_json<Record<string, unknown>>(sheet, {
        defval: '',
      });
      const text = rows
        .map((row, rowIndex) => {
          const cells = Object.entries(row)
            .filter(([, value]) => String(value).trim().length > 0)
            .map(([key, value]) => `${key}: ${String(value).trim()}`)
            .join(' | ');
          return cells ? `第 ${rowIndex + 1} 行：${cells}` : '';
        })
        .filter(Boolean)
        .join('\n');

      return {
        text,
        metadata: { sheet: sheetName },
      };
    });
  }

  private async loadPptx(filePath: string): Promise<LoadedSegment[]> {
    const loader = new PPTXLoader(filePath);
    return this.mapLangchainDocuments(await loader.load());
  }

  private async loadLegacyPpt(filePath: string): Promise<LoadedSegment[]> {
    const buffer = await fs.readFile(filePath);
    const text = buffer
      .toString('latin1')
      .replace(/[^\x20-\x7E\u4e00-\u9fa5]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!text) {
      throw new BadRequestException(
        'Legacy .ppt file has no extractable text. Convert it to .pptx or PDF and retry.',
      );
    }

    return [{ text, metadata: { legacyPpt: true } }];
  }

  private async loadText(filePath: string): Promise<LoadedSegment[]> {
    return [{ text: await fs.readFile(filePath, 'utf8'), metadata: {} }];
  }

  private mapLangchainDocuments(
    documents: Document[],
    normalizeContent: (document: Document) => string = (document) =>
      document.pageContent,
  ): LoadedSegment[] {
    return documents.map((document) => ({
      text: normalizeContent(document),
      metadata: this.sanitizeLangchainMetadata(document.metadata),
    }));
  }

  private sanitizeLangchainMetadata(metadata: Record<string, unknown>) {
    const location: Record<string, unknown> = {};
    const loc = metadata.loc as Record<string, unknown> | undefined;
    const pageNumber = loc?.pageNumber;
    if (typeof pageNumber === 'number') {
      location.page = pageNumber;
    }

    return location;
  }
}
