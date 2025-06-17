import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { GenerateMidDto } from './dto/generate-mid.dto';
import DemoPluginMidTable from './table/demo-plugin-mid-table';

@Injectable()
export class DemoPluginService {
  constructor(private readonly ailyLogOperatorTable: DemoPluginMidTable) {}

  async generateMid(data: GenerateMidDto) {}
}
