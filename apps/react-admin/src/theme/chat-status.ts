import { themePalette } from './index';

export type ChatStatusTone =
  'neutral' | 'warning' | 'success' | 'info' | 'error';

const stageToneMap: Record<string, ChatStatusTone> = {
  analyze_start: 'neutral',
  tool_call: 'warning',
  tool_result: 'success',
  generate_start: 'info',
  done: 'success',
  error: 'error',
  tool_error: 'error',
};

export const chatStatusColors: Record<ChatStatusTone, string> = {
  neutral: themePalette.textSecondary,
  warning: themePalette.warning,
  success: themePalette.success,
  info: themePalette.info,
  error: themePalette.error,
};

export function resolveChatStatusTone(stage: unknown): ChatStatusTone {
  return typeof stage === 'string' && stageToneMap[stage]
    ? stageToneMap[stage]
    : 'neutral';
}
