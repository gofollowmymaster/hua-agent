import type { AgentSystemSkill } from './type/agent-skill.type';

export const AGENT_SYSTEM_SKILLS: readonly AgentSystemSkill[] = [
  {
    key: 'business-knowledge',
    type: 'system',
    name: '业务知识检索',
    description: '检索业务知识库，并基于命中文档回答问题。',
    instruction: `处理业务知识问题时：
1. 优先调用 search_knowledge 检索相关资料。
2. 需要核对文档元数据或阅读完整原文时调用 get_document。
3. 引用资料时说明文档名或来源路径。
4. 工具结果不足时明确说明资料未覆盖。`,
    isEnabled: true,
    readonly: true,
  },
  {
    key: 'ds-order',
    type: 'system',
    name: '一件代发订单',
    description: '查询一件代发订单、操作日志，并处理明确授权的审核或取消。',
    instruction: `处理一件代发订单问题时：
1. 按需调用 list_ds_orders、get_ds_order 或 list_ds_order_logs 查询数据。
2. 只有用户明确要求审核指定订单时才调用 audit_ds_order。
3. 只有用户明确要求取消指定订单时才调用 cancel_ds_order。
4. 仅查询状态或解释流程时不得执行写操作。`,
    isEnabled: true,
    readonly: true,
  },
  {
    key: 'current-time',
    type: 'system',
    name: '当前时间',
    description: '获取 Asia/Shanghai 时区的当前日期和时间。',
    instruction:
      '用户询问当前日期、时间或星期时，调用 get_current_time 后再回答。',
    isEnabled: true,
    readonly: true,
  },
  {
    key: 'calculator',
    type: 'system',
    name: '安全计算',
    description: '使用受限计算工具完成简单四则运算。',
    instruction:
      '需要进行数字、括号和加减乘除计算时调用 calculate，不要依赖心算猜测结果。',
    isEnabled: true,
    readonly: true,
  },
];
