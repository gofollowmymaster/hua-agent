import { Injectable } from '@nestjs/common';
import { Tool, Context } from '@rekog/mcp-nest';
import { z } from 'zod';
import { AliService } from './ali.service';

@Injectable()
export class UserMcpTool {
  constructor(private readonly aliService: AliService) {}

  @Tool({
    name: 'get_user',
    description: '根据 ID 查询用户',
    parameters: z.object({
      id: z.string(),
    }),
  })
  async getUser({ id }: { id: string }, context: Context) {
    // const user = await this.aliService.publish(id);
    console.log('[ context ] >', context, id);
    // return { content: [{ type: 'text', text: JSON.stringify(user) }] };
  }

  // 不加 @Tool 的方法不会暴露！
}
