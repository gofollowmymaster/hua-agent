import { Injectable } from '@nestjs/common';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import type { AgentChatTool } from '../chat/type/agent-chat-runtime.type';
import { DsOrderMockService } from './ds-order-mock.service';
import {
  DsOrderCarrierType,
  DsOrderStatus,
  DsOrderTransportMode,
} from './type/ds-order.type';

/** 将一件代发订单 Mock 查询和操作封装为 Business Agent 工具。 */
@Injectable()
export class DsOrderToolService {
  private readonly tools: AgentChatTool[];

  constructor(private readonly dsOrderService: DsOrderMockService) {
    this.tools = [
      this.buildListTool(),
      this.buildInfoTool(),
      this.buildLogTool(),
      this.buildAuditTool(),
      this.buildCancelTool(),
    ];
  }

  /** 返回可加入 Business Agent 的 DS 订单工具。 */
  getTools() {
    return this.tools;
  }

  private buildListTool() {
    return tool(
      async (params) => JSON.stringify(this.dsOrderService.page(params)),
      {
        name: 'list_ds_orders',
        description: '按条件分页查询当前租户的一件代发订单',
        schema: z.object({
          page: z.number().int().min(1).optional(),
          pageSize: z.number().int().min(1).max(20).optional(),
          dsOrderNoList: z.array(z.string()).max(20).optional(),
          externalCodeList: z.array(z.string()).max(20).optional(),
          statusList: z.nativeEnum(DsOrderStatus).optional(),
          transportMode: z.nativeEnum(DsOrderTransportMode).optional(),
          salePlatformList: z.array(z.string()).max(10).optional(),
          productNameList: z.array(z.string()).max(10).optional(),
          operationsManagerCodeList: z.array(z.string()).max(10).optional(),
          createdAtStart: z.number().int().optional(),
          createdAtEnd: z.number().int().optional(),
          carrierType: z.nativeEnum(DsOrderCarrierType).optional(),
        }),
      },
    );
  }

  private buildInfoTool() {
    return tool(
      async ({ dsOrderNo, queryAvailableQuantity }) =>
        JSON.stringify(
          this.dsOrderService.info({
            dsOrderNo,
            queryAvailableQuantity: queryAvailableQuantity ? 1 : 0,
          }),
        ),
      {
        name: 'get_ds_order',
        description: '根据一件代发订单 ID 查询当前租户的订单详情',
        schema: z.object({
          dsOrderNo: z.string().min(1).describe('一件代发订单 ID'),
          queryAvailableQuantity: z
            .boolean()
            .optional()
            .describe('是否返回商品可用库存'),
        }),
      },
    );
  }

  private buildLogTool() {
    return tool(
      async ({ dsOrderNo, page, pageSize }) =>
        JSON.stringify(
          this.dsOrderService.logPage({
            dsOrderNo: dsOrderNo!,
            page,
            pageSize,
          }),
        ),
      {
        name: 'list_ds_order_logs',
        description: '分页查询当前租户指定一件代发订单的操作日志',
        schema: z.object({
          dsOrderNo: z.string().min(1).describe('一件代发订单 ID'),
          page: z.number().int().min(1).optional(),
          pageSize: z.number().int().min(1).max(20).optional(),
        }),
      },
    );
  }

  private buildAuditTool() {
    const schema = z
      .object({
        dsOrderNo: z.string().min(1).describe('一件代发订单 ID'),
        passed: z.union([z.literal(0), z.literal(1)]),
        msg: z.string().max(500).optional().describe('审核驳回原因'),
      })
      .refine((value) => value.passed === 1 || Boolean(value.msg?.trim()), {
        message: '审核驳回时必须提供原因',
        path: ['msg'],
      });
    return tool(
      async ({ dsOrderNo, passed, msg }) =>
        JSON.stringify(
          this.dsOrderService.audit({
            dsOrderNo: dsOrderNo!,
            passed: passed!,
            msg,
          }),
        ),
      {
        name: 'audit_ds_order',
        description:
          '审核一件代发订单或取消申请；仅当用户明确要求执行审核时调用',
        schema,
      },
    );
  }

  private buildCancelTool() {
    return tool(
      async ({ dsOrderNo, cancelMsg }) =>
        JSON.stringify(
          this.dsOrderService.cancel({
            dsOrderNo: dsOrderNo!,
            cancelMsg: cancelMsg!,
          }),
        ),
      {
        name: 'cancel_ds_order',
        description: '为一件代发订单提交取消申请；仅当用户明确要求取消时调用',
        schema: z.object({
          dsOrderNo: z.string().min(1).describe('一件代发订单 ID'),
          cancelMsg: z.string().min(1).max(500).describe('取消原因'),
        }),
      },
    );
  }
}
