import { Injectable } from '@nestjs/common';

import { RedisService } from '@src/common/service/redis/redis.service';
import Redis from 'ioredis';
import { SupplierDiffDto } from './dto/supplier-diff.dto';
import SupplierDiffTable from '../common/table/supplier-diff.table';
import { BitTableFilter } from '@src/common/feishu/type/bitable';

@Injectable()
export class SupplierDiffService {
  private readonly redis: Redis;

  constructor(
    private readonly redisService: RedisService,
    private readonly supplierDiffTable: SupplierDiffTable,
  ) {
    this.redis = redisService.getClient();
  }

  async list({ businessLine, appCode }: SupplierDiffDto) {
    const filter: BitTableFilter = {
      conjunction: 'and',
      conditions: [
        {
          field_name: '业务线',
          operator: 'is',
          value: [businessLine],
        },
        {
          field_name: '应用端',
          operator: 'is',
          value: [appCode],
        },
      ],
    };
    const { items } = await this.supplierDiffTable.search({
      filter,
    });
    const list = items.map(({ fields, record_id }) => {
      return {
        code: record_id,
        desc: fields['用途说明']?.[0]?.text || '',
        type: fields['类型'],
        aplus: fields['aplus']?.[0]?.text || '',
        yurex: fields['yurex']?.[0]?.text || '',
        cloudboat: fields['cloudboat']?.[0]?.text || '',
      };
    });
    return list;
  }
}
