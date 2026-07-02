import { BadRequestException, Injectable } from '@nestjs/common';
import { RagPrismaService } from './prisma/rag-prisma.service';

@Injectable()
export class RagDocumentService {
  constructor(private readonly ragPrisma: RagPrismaService) {}

  async listDocuments() {
    const documents = await this.ragPrisma.aplusDocument.findMany({
      include: {
        _count: {
          select: { chunks: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return documents.map((document) => ({
      id: document.id,
      source_path: document.sourcePath,
      file_name: document.fileName,
      file_type: document.fileType,
      file_hash: document.fileHash,
      file_size: document.fileSize,
      chunk_count: document.chunkCount,
      status: document.status,
      error: document.error,
      created_at: document.createdAt,
      updated_at: document.updatedAt,
      ingested_at: document.ingestedAt,
      actual_chunk_count: document._count.chunks,
    }));
  }

  async deleteDocument(id: number) {
    const document = await this.ragPrisma.aplusDocument.findUnique({
      where: { id },
      select: { id: true, sourcePath: true },
    });

    if (!document) {
      throw new BadRequestException(`Document #${id} not found`);
    }

    await this.ragPrisma.aplusDocument.delete({ where: { id } });

    return {
      deleted: {
        id: document.id,
        source_path: document.sourcePath,
      },
    };
  }
}
