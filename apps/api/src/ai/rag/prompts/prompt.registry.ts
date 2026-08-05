import { BadRequestException, Injectable } from '@nestjs/common';
import { PromptTemplate } from '@langchain/core/prompts';
import type { RetrievedChunk } from '../types/rag.type';
import type {
  IPromptBuildContext,
  IPromptCategory,
  IPromptModule,
  IPromptVersion,
} from './prompt.interface';
import { qaV1 } from './qa/v1';
import { rewriteV1 } from './rewrite/v1';
import { routeV1 } from './route/v1';
import { directV1 } from './direct/v1';

/**
 * 提示词注册中心服务
 *
 * 管理版本化提示词模板，提供：
 * - buildPrompt()  按类型+版本构建完整 prompt
 * - formatContext() 格式化检索结果
 * - formatMemory() 格式化对话记忆
 * - formatLocation() 提取位置信息（页码/工作表/幻灯片）
 * - buildPreviewLink() 构建文档预览链接
 *
 * 版本切换：通过 vcHelper.ragPromptVersion 配置控制，默认 'v1'
 */
@Injectable()
export class PromptRegistryService {
  private static readonly DEFAULT_VERSION = 'v1';

  /**
   * 当前活跃的提示词版本
   * 从 NodeConfigService.get('vcHelper').ragPromptVersion 读取
   */
  private readonly activeVersion: string;

  /**
   * 已注册的提示词模块表
   * key: 分类名 ('qa', 'rewrite', ...)
   * value: 版本号 → IPromptVersion 映射
   */
  private readonly modules: IPromptModule;

  constructor() {
    this.activeVersion = PromptRegistryService.DEFAULT_VERSION;

    this.modules = {
      qa: { v1: qaV1 },
      rewrite: { v1: rewriteV1 },
      route: { v1: routeV1 },
      direct: { v1: directV1 },
      // 未来扩展：
      // qa: { v1: qaV1, v2: qaV2 },
    };
  }

  /**
   * 按类型+当前活跃版本构建完整 prompt
   *
   * @param type    - 提示词分类，如 'qa'
   * @param context - 构建上下文（question + chunks + 已格式化的 memory）
   * @returns 完整的 prompt 字符串，可直接传给 LLM
   */
  async buildPrompt(
    type: IPromptCategory,
    context: IPromptBuildContext,
  ): Promise<string> {
    const version = this.getActiveVersion(type);
    const template = this.loadTemplate(type, version);
    const prompt = PromptTemplate.fromTemplate(template.systemPrompt);

    const promptValue = await prompt.invoke({
      question: context.question,
      memory: context.memory,
      context: context.chunks ? this.formatContext(context.chunks) : '',
      formatInstructions: context.formatInstructions ?? '',
    });

    return promptValue.toString();
  }

  /**
   * 格式化检索片段上下文为 prompt 片段
   */
  formatContext(chunks: RetrievedChunk[]): string {
    if (chunks.length === 0) {
      return '未检索到相关资料。';
    }

    return chunks
      .map((chunk, index) => {
        const location = this.formatLocation(chunk.metadata);
        return `文档 ${index + 1}：
标题：${chunk.fileName}${location ? `（${location}）` : ''}
链接：${this.buildPreviewLink(chunk.documentId)}
相似度：${chunk.similarity.toFixed(4)}
内容摘录：
${chunk.content}`;
      })
      .join('\n\n---\n\n');
  }

  /**
   * 格式化对话记忆为 prompt 片段
   */
  formatMemory(messages: { role: string; content: string }[]): string {
    if (messages.length === 0) return '无最近对话。';

    return messages
      .map((msg, index) => {
        const role = msg.role === 'user' ? '用户' : '助手';
        return `[${index + 1}] ${role}：${msg.content}`;
      })
      .join('\n');
  }

  /**
   * 从 metadata 提取位置信息（页码 / 工作表 / 幻灯片）
   */
  formatLocation(metadata: Record<string, unknown>): string {
    if (metadata.page) return `第 ${metadata.page} 页`;
    if (metadata.sheet) return `工作表 ${metadata.sheet}`;
    if (metadata.slide) return `第 ${metadata.slide} 页幻灯片`;
    return '';
  }

  /**
   * 构建文档预览 URL
   */
  buildPreviewLink(documentId: string): string {
    return `/ai/rag/admin/documents/${encodeURIComponent(documentId)}/preview`;
  }

  /**
   * 查询指定分类的当前活跃版本
   *
   * 如果 activeVersion 不存在，回退到默认版本 'v1'
   */
  getActiveVersion(type: IPromptCategory): string {
    const available = this.modules[type];
    if (!available) {
      throw new BadRequestException(`Unknown prompt type: ${type}`);
    }

    if (available[this.activeVersion]) {
      return this.activeVersion;
    }

    // fallback to default version
    return PromptRegistryService.DEFAULT_VERSION;
  }

  /**
   * 加载指定类型+版本的提示词模板
   *
   * @throws BadRequestException 如果版本不存在
   */
  private loadTemplate(type: IPromptCategory, version: string): IPromptVersion {
    const available = this.modules[type];
    if (!available?.[version]) {
      throw new BadRequestException(
        `Prompt version "${version}" not found for type "${type}"`,
      );
    }
    return available[version];
  }
}
