import type { RetrievedChunk } from '../types/rag.type';

/**
 * 提示词构建上下文
 * 调用 buildPrompt() 前，由调用方通过 formatMemory() 预先格式化记忆
 */
export interface IPromptBuildContext {
  /** 用户原始问题 */
  question: string;
  /** 向量检索返回的文档片段（未格式化） */
  chunks?: RetrievedChunk[];
  /** 已格式化的对话记忆文本（由 formatMemory() 生成） */
  memory: string;
  /** 结构化输出格式说明，例如 StructuredOutputParser.getFormatInstructions() */
  formatInstructions?: string;
}

/**
 * 提示词版本定义
 * 每种用途（qa/rewrite 等）可以有多个版本
 */
export interface IPromptVersion {
  /** 版本标识，如 'v1'、'v2' */
  version: string;
  /** 完整��系统提示词模板。
   *  使用 LangChain PromptTemplate 变量语法：
   *  - {question}  用户问题
   *  - {context}   格式化后的知识库检索结果
   *  - {memory}    格式化后的对话记忆
   *  - {formatInstructions} 结构化输出格式说明 */
  systemPrompt: string;
  /** 该版本使用的大语言模型名称（可选，默认使用全局配置） */
  modelName?: string;
  /** 该版本的其他模型参数（如 temperature） */
  modelParams?: Record<string, unknown>;
}

/**
 * 提示词使用分类
 */
export type IPromptCategory = 'qa' | 'rewrite' | string;

/**
 * 提示词模块注册表
 *
 * 每个分类下存放各版本的提示词模板。
 * 示例：
 *   import { qaV1 } from './qa/v1';
 *   import { rewriteV1 } from './rewrite/v1';
 *   const modules: IPromptModule = {
 *     qa: { v1: qaV1 },
 *     rewrite: { v1: rewriteV1 },
 *   };
 */
export interface IPromptModule {
  [category: string]: Record<string, IPromptVersion>;
}
