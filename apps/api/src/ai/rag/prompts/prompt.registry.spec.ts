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
});
