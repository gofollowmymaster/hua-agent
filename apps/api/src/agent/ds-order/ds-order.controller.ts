import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CompositeAuthOrSecretGuard } from '@src/common/guard/composite-auth';
import {
  DsOrderAuditDto,
  DsOrderCancelDto,
  DsOrderInfoDto,
  DsOrderLogPageDto,
  DsOrderPageDto,
} from './dto/ds-order.dto';
import { DsOrderMockService } from './ds-order-mock.service';

/** 提供与原 OMS 地址兼容的一件代发订单 Mock 接口。 */
@ApiTags('一件代发订单 Mock')
@Controller('oms/admin/dsOrder')
@UseGuards(CompositeAuthOrSecretGuard)
export class DsOrderController {
  constructor(private readonly dsOrderService: DsOrderMockService) {}

  /** 分页查询当前租户的一件代发订单。 */
  @Post('page')
  @ApiOperation({ summary: '分页查询一件代发订单' })
  page(@Body() body: DsOrderPageDto) {
    return this.dsOrderService.page(body);
  }

  /** 查询当前租户的一件代发订单详情。 */
  @Post('info')
  @ApiOperation({ summary: '查询一件代发订单详情' })
  info(@Body() body: DsOrderInfoDto) {
    return this.dsOrderService.info(body);
  }

  /** 分页查询当前租户的一件代发订单日志。 */
  @Post('logPage')
  @ApiOperation({ summary: '分页查询一件代发订单日志' })
  logPage(@Body() body: DsOrderLogPageDto) {
    return this.dsOrderService.logPage(body);
  }

  /** 审核当前租户的一件代发订单或取消申请。 */
  @Post('audit')
  @ApiOperation({ summary: '审核一件代发订单' })
  audit(@Body() body: DsOrderAuditDto) {
    return this.dsOrderService.audit(body);
  }

  /** 为当前租户的一件代发订单提交取消申请。 */
  @Post('cancel')
  @ApiOperation({ summary: '取消一件代发订单' })
  cancel(@Body() body: DsOrderCancelDto) {
    return this.dsOrderService.cancel(body);
  }
}
