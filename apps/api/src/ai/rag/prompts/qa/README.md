# QA 提示词

## 目录结构

```
prompts/qa/
├── v1.ts        # V1 版本：企微答疑助手「晓晓」
├── v2.ts        # 未来：V2 实验版本
└── README.md    # 本文档
```

## 版本机制

同一类型的提示词可以有多个版本（V1、V2…），方便切换观测效果。

每个版本文件默认导出 `IPromptVersion` 接口的实现：

```typescript
export const qaV1: IPromptVersion = {
  version: 'v1',
  systemPrompt: `...`,
};
```

## 如何添加新版本

1. 在 `prompts/qa/` 下新建 `v2.ts`：

```typescript
import type { IPromptVersion } from '../prompt.interface';

export const qaV2: IPromptVersion = {
  version: 'v2',
  systemPrompt: `你是一个...`,
};
```

2. 在 `prompts/prompt.registry.ts` 的 `modules` 中注册：

```typescript
import { qaV2 } from './qa/v2';

this.modules = {
  qa: { v1: qaV1, v2: qaV2 },
};
```

3. 通过环境变量或配置切换版本：

```bash
RAG_PROMPT_VERSION=v2
```

## 变量占位符

提示词模板使用 LangChain `PromptTemplate` 变量语法：

| 变量 | 含义 | 格式化方 |
|------|------|----------|
| `{question}` | 用户原始问题 | 直接传入 |
| `{memory}`   | 格式化后的对话记忆 | `PromptRegistryService.formatMemory()` |
| `{context}`  | 格式化后的检索结果 | `PromptRegistryService.formatContext()` |
