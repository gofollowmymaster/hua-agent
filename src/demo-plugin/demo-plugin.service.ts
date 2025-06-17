import { Injectable } from '@nestjs/common';
import { GenerateMidDto } from './dto/generate-mid.dto';
import DemoPluginMidTable from './table/demo-plugin-mid-table';
import { buildUUID } from 'src/utils/uuid';

@Injectable()
export class DemoPluginService {
  constructor(private readonly demoPluginMidTable: DemoPluginMidTable) {}

  async generateMid(data: GenerateMidDto) {
    console.log('[ data ] >', data);
    return { mid: buildUUID() };
  }
  async verify(MId: string) {
    // conjunction?: "and" | "or";
    // conditions?: Array<{
    //     field_name: string;
    //     operator: "is" | "isNot" | "contains" | "doesNotContain" | "isEmpty" | "isNotEmpty" | "isGreater" | "isGreaterEqual" | "isLess" | "isLessEqual" | "like" | "in";
    //     value?: Array<string>;
    // }>;
    const filter = {
      conjunction: 'and',
      conditions: [
        {
          field_name: 'MId',
          operator: 'is',
          value: [MId],
        },
      ],
    };

    const records = this.demoPluginMidTable.list();
    console.log('[ filter ] >', records);
    return records;
  }
}
