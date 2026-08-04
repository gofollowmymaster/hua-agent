import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { BadRequestException } from '@nestjs/common';
import { RagDocumentUploadService } from './rag-document-upload.service';

describe('RagDocumentUploadService', () => {
  let root: string;
  let tempDir: string;
  let rawDir: string;
  let loader: {
    isSupportedFileName: jest.Mock;
    getSupportedExtensions: jest.Mock;
    hashFile: jest.Mock;
    resolveTenantRawDir: jest.Mock;
    buildRawDocumentFile: jest.Mock;
  };
  let ingest: {
    findDocumentByHash: jest.Mock;
    ingestFiles: jest.Mock;
  };
  let service: RagDocumentUploadService;

  beforeEach(async () => {
    root = await fs.mkdtemp(path.join(os.tmpdir(), 'rag-upload-'));
    tempDir = path.join(root, 'tmp');
    rawDir = path.join(root, 'raw', 'boat');
    await fs.mkdir(tempDir, { recursive: true });
    loader = {
      isSupportedFileName: jest.fn((fileName: string) =>
        ['.pdf', '.docx', '.xlsx', '.ppt', '.pptx', '.txt', '.md'].includes(
          path.extname(fileName).toLowerCase(),
        ),
      ),
      getSupportedExtensions: jest
        .fn()
        .mockReturnValue([
          '.pdf',
          '.docx',
          '.xlsx',
          '.ppt',
          '.pptx',
          '.txt',
          '.md',
        ]),
      hashFile: jest.fn(async (filePath: string) =>
        crypto
          .createHash('sha256')
          .update(await fs.readFile(filePath))
          .digest('hex'),
      ),
      resolveTenantRawDir: jest.fn().mockReturnValue(rawDir),
      buildRawDocumentFile: jest.fn(async (absolutePath, _tenant, options) => ({
        absolutePath,
        sourcePath: options.sourcePath,
        fileName: options.fileName,
        fileType: path.extname(options.fileName).slice(1),
        documentType: '',
        fileHash: await loader.hashFile(absolutePath),
        fileSize: (await fs.stat(absolutePath)).size,
      })),
    };
    ingest = {
      findDocumentByHash: jest.fn().mockResolvedValue(undefined),
      ingestFiles: jest.fn().mockResolvedValue({
        files: [{ status: 'indexed', documentId: '1', chunks: 2 }],
      }),
    };
    service = new RagDocumentUploadService(
      loader as any,
      ingest as any,
      { tenant: 'boat' } as any,
    );
  });

  afterEach(async () => {
    await fs.rm(root, { recursive: true, force: true });
  });

  it('rejects an empty multipart request', async () => {
    await expect(service.uploadDocuments([])).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('processes supported files while reporting unsupported files as failed', async () => {
    const valid = await createUploadFile('guide.md', 'content');
    const invalid = await createUploadFile('legacy.doc', 'old');

    const result = await service.uploadDocuments([valid, invalid]);

    expect(result).toMatchObject({
      totalFiles: 2,
      indexedFiles: 1,
      failedFiles: 1,
      duplicateFiles: 0,
      chunks: 2,
    });
    expect(result.files[1]).toMatchObject({
      fileName: 'legacy.doc',
      status: 'failed',
    });
    await expect(fs.access(valid.path)).rejects.toThrow();
    await expect(fs.access(invalid.path)).rejects.toThrow();
  });

  it('reports same-batch and existing-database hashes as duplicates', async () => {
    const first = await createUploadFile('first.md', 'same');
    const repeated = await createUploadFile('second.md', 'same');
    const existing = await createUploadFile('third.md', 'existing');
    ingest.findDocumentByHash.mockImplementation(
      async (_tenant: string, hash: string) =>
        hash === hashOf('existing')
          ? { id: BigInt(8), fileName: 'stored.md' }
          : undefined,
    );

    const result = await service.uploadDocuments([first, repeated, existing]);

    expect(result.duplicateFiles).toBe(2);
    expect(result.files[1]).toMatchObject({
      status: 'duplicate',
      reason: 'duplicate of first.md in current batch',
    });
    expect(result.files[2]).toMatchObject({
      status: 'duplicate',
      duplicateOf: { documentId: '8', fileName: 'stored.md' },
    });
    expect(ingest.ingestFiles).toHaveBeenCalledTimes(1);
  });

  it('uses a suffix for same-name files with different content', async () => {
    const first = await createUploadFile('guide.md', 'first');
    const second = await createUploadFile('guide.md', 'second');
    ingest.ingestFiles
      .mockResolvedValueOnce({
        files: [{ status: 'indexed', documentId: '1', chunks: 1 }],
      })
      .mockResolvedValueOnce({
        files: [{ status: 'indexed', documentId: '2', chunks: 1 }],
      });

    const result = await service.uploadDocuments([first, second]);

    expect(result.files.map((item) => item.sourcePath)).toEqual([
      'guide.md',
      'guide (1).md',
    ]);
    expect(await fs.readdir(rawDir)).toEqual(['guide (1).md', 'guide.md']);
  });

  it('restores a UTF-8 filename decoded as Latin-1 by multipart parsing', async () => {
    const fileName = '亚马逊日报.pdf';
    const mojibakeName = Buffer.from(fileName, 'utf8').toString('latin1');
    const upload = await createUploadFile(mojibakeName, 'content');

    const result = await service.uploadDocuments([upload]);

    expect(result.files[0]).toMatchObject({
      fileName,
      sourcePath: fileName,
      status: 'indexed',
    });
    expect(loader.buildRawDocumentFile).toHaveBeenCalledWith(
      path.join(rawDir, fileName),
      'boat',
      { sourcePath: fileName, fileName },
    );
  });

  it('keeps an already valid Unicode filename unchanged', async () => {
    const fileName = '亚马逊日报.md';
    const upload = await createUploadFile(fileName, 'content');

    const result = await service.uploadDocuments([upload]);

    expect(result.files[0].fileName).toBe(fileName);
  });

  it('retains the raw file when indexing fails and removes the temporary file', async () => {
    const upload = await createUploadFile('../unsafe.md', 'content');
    ingest.ingestFiles.mockResolvedValue({
      files: [{ status: 'failed', reason: 'embedding unavailable' }],
    });

    const result = await service.uploadDocuments([upload]);

    expect(result.files[0]).toMatchObject({
      fileName: 'unsafe.md',
      status: 'failed',
      sourcePath: 'unsafe.md',
      reason: 'embedding unavailable',
    });
    await expect(
      fs.access(path.join(rawDir, 'unsafe.md')),
    ).resolves.toBeUndefined();
    await expect(fs.access(upload.path)).rejects.toThrow();
  });

  async function createUploadFile(originalname: string, content: string) {
    const filePath = path.join(tempDir, crypto.randomUUID());
    await fs.writeFile(filePath, content);
    return {
      path: filePath,
      originalname,
      size: Buffer.byteLength(content),
    } as Express.Multer.File;
  }

  function hashOf(content: string) {
    return crypto.createHash('sha256').update(content).digest('hex');
  }
});
