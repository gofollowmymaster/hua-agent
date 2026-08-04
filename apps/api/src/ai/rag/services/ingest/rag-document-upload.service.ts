import { BadRequestException, Injectable } from '@nestjs/common';
import { constants as fsConstants } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { TenantContext } from '@src/common/service/context/tenant.context';
import { NodeConfigService } from '@src/config/node-config.service';
import type { TenantCode } from '@src/config/tenant';
import type {
  RagDocumentUploadFileResult,
  RagDocumentUploadResult,
} from '../../types/rag.type';
import { DocumentLoaderService } from './document-loader.service';
import { RagIngestService } from './rag-ingest.service';

@Injectable()
export class RagDocumentUploadService {
  constructor(
    private readonly loader: DocumentLoaderService,
    private readonly ragIngestService: RagIngestService,
    private readonly tenantContext: TenantContext,
  ) {}

  async uploadDocuments(
    files: Express.Multer.File[],
  ): Promise<RagDocumentUploadResult> {
    if (!files?.length) {
      throw new BadRequestException('files are required');
    }

    const tenantCode = this.currentTenant();
    const batchHashes = new Map<string, string>();
    const results: RagDocumentUploadFileResult[] = [];

    for (const file of files) {
      try {
        results.push(await this.processFile(file, tenantCode, batchHashes));
      } finally {
        await this.removeFileIfExists(file.path, true);
      }
    }

    return {
      totalFiles: files.length,
      indexedFiles: results.filter((item) => item.status === 'indexed').length,
      duplicateFiles: results.filter((item) => item.status === 'duplicate')
        .length,
      failedFiles: results.filter((item) => item.status === 'failed').length,
      chunks: results.reduce((total, item) => total + (item.chunks ?? 0), 0),
      files: results,
    };
  }

  private async processFile(
    file: Express.Multer.File,
    tenantCode: TenantCode,
    batchHashes: Map<string, string>,
  ): Promise<RagDocumentUploadFileResult> {
    const fileName = this.sanitizeFileName(file.originalname);
    if (!fileName) {
      return {
        fileName: file.originalname || '-',
        status: 'failed',
        reason: 'invalid file name',
      };
    }
    if (!this.loader.isSupportedFileName(fileName)) {
      return {
        fileName,
        status: 'failed',
        reason: `unsupported file type; supported: ${this.loader
          .getSupportedExtensions()
          .join(', ')}`,
      };
    }

    let storedAbsolutePath: string | undefined;
    try {
      const fileHash = await this.loader.hashFile(file.path);
      const firstBatchFile = batchHashes.get(fileHash);
      if (firstBatchFile) {
        return {
          fileName,
          status: 'duplicate',
          reason: `duplicate of ${firstBatchFile} in current batch`,
        };
      }
      batchHashes.set(fileHash, fileName);

      const existing = await this.ragIngestService.findDocumentByHash(
        tenantCode,
        fileHash,
      );
      if (existing) {
        return this.buildDuplicateResult(fileName, existing);
      }

      const stored = await this.saveToTenantRaw(
        file.path,
        fileName,
        tenantCode,
      );
      storedAbsolutePath = stored.absolutePath;
      const rawFile = await this.loader.buildRawDocumentFile(
        stored.absolutePath,
        tenantCode,
        {
          sourcePath: stored.sourcePath,
          fileName,
        },
      );
      const ingest = await this.ragIngestService.ingestFiles([rawFile], {
        tenantCode,
      });
      const result = ingest.files[0];

      if (result?.status === 'indexed') {
        return {
          fileName,
          status: 'indexed',
          documentId: result.documentId,
          sourcePath: stored.sourcePath,
          chunks: result.chunks,
        };
      }

      if (result?.status === 'skipped' && result.reason === 'duplicate hash') {
        await this.removeFileIfExists(stored.absolutePath);
        storedAbsolutePath = undefined;
        return {
          fileName,
          status: 'duplicate',
          reason: 'duplicate hash',
          duplicateOf: result.duplicateOf,
        };
      }

      return {
        fileName,
        status: 'failed',
        sourcePath: stored.sourcePath,
        reason: result?.reason ?? 'document indexing failed',
      };
    } catch (error) {
      return {
        fileName,
        status: 'failed',
        sourcePath: storedAbsolutePath
          ? path.basename(storedAbsolutePath)
          : undefined,
        reason: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private buildDuplicateResult(
    fileName: string,
    existing: { id: bigint | number | string; fileName: string },
  ): RagDocumentUploadFileResult {
    return {
      fileName,
      status: 'duplicate',
      reason: 'duplicate hash',
      duplicateOf: {
        documentId: String(existing.id),
        fileName: existing.fileName,
      },
    };
  }

  private async saveToTenantRaw(
    tempPath: string,
    fileName: string,
    tenantCode: TenantCode,
  ) {
    const tenantRawDir = this.loader.resolveTenantRawDir(tenantCode);
    await fs.mkdir(tenantRawDir, { recursive: true });
    const extension = path.extname(fileName);
    const baseName = path.basename(fileName, extension);

    for (let suffix = 0; suffix < 10_000; suffix += 1) {
      const candidateName =
        suffix === 0 ? fileName : `${baseName} (${suffix})${extension}`;
      const absolutePath = path.join(tenantRawDir, candidateName);
      try {
        await fs.copyFile(tempPath, absolutePath, fsConstants.COPYFILE_EXCL);
        return { absolutePath, sourcePath: candidateName };
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error;
      }
    }

    throw new BadRequestException('too many files with the same name');
  }

  private sanitizeFileName(value: string): string {
    return path
      .basename((value ?? '').replace(/\\/g, '/'))
      .normalize('NFC')
      .replace(/[\u0000-\u001f\u007f]/g, '')
      .trim();
  }

  private async removeFileIfExists(
    filePath?: string,
    ignoreFailure = false,
  ): Promise<void> {
    if (!filePath) return;
    try {
      await fs.unlink(filePath);
    } catch (error) {
      if (
        !ignoreFailure &&
        (error as NodeJS.ErrnoException).code !== 'ENOENT'
      ) {
        throw error;
      }
    }
  }

  private currentTenant(): TenantCode {
    return this.tenantContext.tenant ?? NodeConfigService.get('defaultTenant');
  }
}
