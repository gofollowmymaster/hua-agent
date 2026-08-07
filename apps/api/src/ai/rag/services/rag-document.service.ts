import { BadRequestException, Injectable } from '@nestjs/common';
import { TenantContext } from '@src/common/service/context/tenant.context';
import { NodeConfigService } from '@src/config/node-config.service';
import { TenantCode } from '@src/config/tenant';
import { RagPrismaService } from '@src/common/service/rag-prisma/rag-prisma.service';

/** 管理当前租户已索引文档的查询和删除。 */
@Injectable()
export class RagDocumentService {
  constructor(
    private readonly ragPrisma: RagPrismaService,
    private readonly tenantContext: TenantContext,
  ) {}

  /** 查询当前租户文档及其实际切片数量。 */
  async listDocuments() {
    const tenantCode = this.currentTenant();
    const documents = await this.ragPrisma.aplusDocument.findMany({
      where: { tenantCode },
      include: {
        _count: {
          select: { chunks: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return documents.map((document) => ({
      id: document.id,
      tenant_code: document.tenantCode,
      source_path: document.sourcePath,
      file_name: document.fileName,
      file_type: document.fileType,
      type: document.type,
      tag: document.tag,
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

  /** 校验租户归属后删除指定文档及其关联切片。 */
  async deleteDocument(id: number) {
    const tenantCode = this.currentTenant();
    const document = await this.ragPrisma.aplusDocument.findUnique({
      where: { id },
      select: { id: true, tenantCode: true, sourcePath: true },
    });

    if (!document || document.tenantCode !== tenantCode) {
      throw new BadRequestException(`Document #${id} not found`);
    }

    await this.ragPrisma.aplusDocument.delete({ where: { id } });

    return {
      deleted: {
        id: document.id,
        tenant_code: document.tenantCode,
        source_path: document.sourcePath,
      },
    };
  }

  /** 获取请求租户，并在无请求上下文时回退到默认租户。 */
  private currentTenant(): TenantCode {
    return this.tenantContext.tenant ?? NodeConfigService.get('defaultTenant');
  }
}
