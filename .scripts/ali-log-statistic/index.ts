import { data } from './data';

/**
 * 从日志 content 中提取所有 Bearer token
 */
function extractBearerTokens(content: string): string[] {
  const re = /authorization"\s*:\s*"Bearer\s+([^"]+)"/gi;
  const tokens: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) tokens.push(m[1]);
  return tokens;
}

/**
 * 解码 JWT payload（不验证签名）
 */
function decodeJwtPayload(token: string): any | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    let payload = parts[1];
    // base64url -> base64
    payload = payload.replace(/-/g, '+').replace(/_/g, '/');
    const pad = payload.length % 4;
    if (pad) payload += '='.repeat(4 - pad);
    const json = Buffer.from(payload, 'base64').toString('utf8');
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * 处理数据并返回每条记录对应的 token 与解析结果
 */
export function parseDataTokens(records: { content?: string }[]) {
  return records.map((rec, idx) => {
    const content = rec.content ?? '';
    const tokens = extractBearerTokens(content);
    const decoded = tokens.map((t) => decodeJwtPayload(t));
    return { index: idx, tokens, decoded };
  });
}

// 如果直接运行此文件，会将结果打印到 stdout

const results = parseDataTokens(data as any[])
  .map((item) => item.decoded[0])
  .filter((item) => item);

//对 results 按照tenantName字results段分组
const groupByTenantId = results.reduce((acc, item) => {
  const userId = item?.userId;
  if (!acc[userId]) {
    acc[userId] = {
      ...item,
      count: 1,
    };
  } else {
    acc[userId].count = acc[userId].count + 1;
  }

  return acc;
}, {});
console.log(JSON.stringify(groupByTenantId, null, 2));
