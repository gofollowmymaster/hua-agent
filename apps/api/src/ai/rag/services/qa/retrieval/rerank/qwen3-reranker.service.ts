import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { NotReportException } from '@src/common/exception/not-report-exception';
import { NodeConfigService } from '@src/config/node-config.service';
import { firstValueFrom } from 'rxjs';
import type { RetrievalCandidate } from '../../../../types/rag.type';
import type { RagReranker, RagRerankInput } from './rag-reranker';

type Qwen3RerankResponse = {
  output?: {
    results?: Array<{
      index?: number;
      relevance_score?: number;
    }>;
  };
};

/** 调用 Qwen3 外部模型按语义相关度重排检索候选。 */
@Injectable()
export class Qwen3Reranker implements RagReranker {
  constructor(private readonly httpService: HttpService) {}

  /** 请求重排模型并严格校验候选索引与相关度分数。 */
  async rerank(input: RagRerankInput): Promise<RetrievalCandidate[]> {
    if (input.candidates.length === 0) return [];

    const url = (NodeConfigService.get('rerankUrl') as string)?.trim();
    const apiKey = (NodeConfigService.get('rerankApiKey') as string)?.trim();
    if (!url) {
      throw new NotReportException('Qwen3 rerank URL is not configured', 500);
    }
    if (!apiKey) {
      throw new NotReportException(
        'Qwen3 rerank API key is not configured',
        500,
      );
    }

    const response = await firstValueFrom(
      this.httpService.post<Qwen3RerankResponse>(
        url,
        {
          model: NodeConfigService.get('rerankModel'),
          input: {
            query: input.query,
            documents: input.candidates.map((candidate) => candidate.content),
          },
          parameters: {
            return_documents: false,
            top_n: input.topK,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: NodeConfigService.get('rerankTimeoutMs'),
          validateStatus: () => true,
        },
      ),
    );

    if (response.status < 200 || response.status >= 300) {
      throw new NotReportException(
        `Qwen3 rerank request failed with status ${response.status}`,
        response.status,
      );
    }

    const results = response.data?.output?.results;
    if (!Array.isArray(results) || results.length === 0) {
      throw new NotReportException('Qwen3 rerank returned no results', 500);
    }

    // 严格按原候选 index 映射，避免异常响应把分数写入错误片段。
    const indexes = new Set<number>();
    return results.map((result) => {
      const index = result?.index;
      const relevanceScore = result?.relevance_score;
      if (
        !Number.isInteger(index) ||
        index < 0 ||
        index >= input.candidates.length ||
        indexes.has(index)
      ) {
        throw new NotReportException(
          'Qwen3 rerank returned an invalid candidate index',
          500,
        );
      }
      if (
        typeof relevanceScore !== 'number' ||
        !Number.isFinite(relevanceScore)
      ) {
        throw new NotReportException(
          'Qwen3 rerank returned an invalid relevance score',
          500,
        );
      }

      indexes.add(index);
      const candidate = input.candidates[index];
      return {
        ...candidate,
        score: relevanceScore,
        retrieval: {
          ...candidate.retrieval,
          rerankScore: relevanceScore,
          rerankMode: 'model' as const,
        },
      };
    });
  }
}
