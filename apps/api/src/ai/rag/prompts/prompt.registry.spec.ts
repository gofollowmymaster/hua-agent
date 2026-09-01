import { PromptRegistryService } from './prompt.registry';

describe('PromptRegistryService', () => {
  it('builds rewrite prompt with escaped JSON examples and format instructions', async () => {
    const service = new PromptRegistryService();

    await expect(
      service.buildPrompt('rewrite', {
        question: '审批呢？',
        chunks: [],
        memory: '无最近对话。',
        formatInstructions:
          'Return a JSON object: {"rewrittenQuestion":"...","rewriteReason":"..."}',
      }),
    ).resolves.toContain('费用报销审批流程');
  });

  it('instructs the QA model to output visible reasoning in simplified Chinese', async () => {
    const service = new PromptRegistryService();

    await expect(
      service.buildPrompt('qa', {
        question: '审批流程是什么？',
        chunks: [],
        memory: '无最近对话。',
      }),
    ).resolves.toContain('当系统输出用户可见的思考过程时，仅使用简体中文。');
  });
});
