import { BadRequestException, Injectable } from '@nestjs/common';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { XMLParser } from 'fast-xml-parser';
import JSZip from 'jszip';
import mammoth from 'mammoth';
import pdfParse from 'pdf-parse';
import xlsx from 'xlsx';
import { getRagConfig } from '../rag.config';
import type { LoadedDocument, LoadedSegment, RawDocumentFile } from '../types';

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
    this.rawDir = path.resolve(process.cwd(), getRagConfig().rawDir);
  }

  async scanRawFiles(): Promise<RawDocumentFile[]> {
    const absolutePaths = await this.walk(this.rawDir);
    const files: RawDocumentFile[] = [];

    for (const absolutePath of absolutePaths) {
      const ext = path.extname(absolutePath).toLowerCase();
      if (!SUPPORTED_EXTENSIONS.has(ext)) continue;

      const stat = await fs.stat(absolutePath);
      const sourcePath = path.relative(process.cwd(), absolutePath);
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
    const entries = await fs.readdir(dir, { withFileTypes: true });
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
    const pages: string[] = [];
    const buffer = await fs.readFile(filePath);
    await pdfParse(buffer, {
      pagerender: async (pageData) => {
        const textContent = await pageData.getTextContent();
        const text = textContent.items
          .map((item: { str?: string }) => item.str ?? '')
          .join(' ');
        pages.push(text);
        return text;
      },
    });

    return pages.map((text, index) => ({
      text,
      metadata: { page: index + 1 },
    }));
  }

  private async loadDocx(filePath: string): Promise<LoadedSegment[]> {
    const result = await mammoth.extractRawText({ path: filePath });
    return [{ text: result.value, metadata: {} }];
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
    const buffer = await fs.readFile(filePath);
    const zip = await JSZip.loadAsync(buffer);
    const parser = new XMLParser({ ignoreAttributes: false });
    const slidePaths = Object.keys(zip.files)
      .filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name))
      .sort((a, b) => this.slideNumber(a) - this.slideNumber(b));

    const segments: LoadedSegment[] = [];
    for (const slidePath of slidePaths) {
      const xml = await zip.files[slidePath].async('text');
      const parsed = parser.parse(xml);
      const texts: string[] = [];
      this.collectText(parsed, texts);

      segments.push({
        text: texts.join('\n'),
        metadata: { slide: this.slideNumber(slidePath) },
      });
    }

    return segments;
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

  private slideNumber(slidePath: string): number {
    const match = /slide(\d+)\.xml$/.exec(slidePath);
    return match ? Number(match[1]) : 0;
  }

  private collectText(node: unknown, output: string[]) {
    if (!node || typeof node !== 'object') return;

    if (Array.isArray(node)) {
      for (const child of node) this.collectText(child, output);
      return;
    }

    const record = node as Record<string, unknown>;
    for (const [key, value] of Object.entries(record)) {
      if (key === 'a:t' && typeof value === 'string') {
        const text = value.trim();
        if (text) output.push(text);
      } else {
        this.collectText(value, output);
      }
    }
  }
}
