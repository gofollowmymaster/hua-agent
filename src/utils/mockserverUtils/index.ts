import { join } from 'path';

/**
 * 根据请求路径返回网关名称
 * @param path:string
 * @returns string | null
 */
export function getGateWayName(url: string): string | null {
  const match = url.match(/^https?:\/\/[^\/]+\/([^\/]+)\//);
  return match ? match[1] : null;
}
export function getMockServerFilePath(gateWayName: string): string {
  return join(__dirname, '..', 'mockServer', `${gateWayName}.json`);
}
