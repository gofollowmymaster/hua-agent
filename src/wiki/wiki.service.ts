import { Injectable } from '@nestjs/common';
import { WikiDto } from './dto/wiki.dto';

import { LoggerService } from '@src/common/service/logger/logger.service';

import { ConfigService } from '@nestjs/config';

@Injectable()
export class WikiService {
  // private messageHelper;
  constructor(
    private readonly logger: LoggerService,
    private readonly config: ConfigService,
  ) {}

  async tree(params: WikiDto) {
    console.log('[ params ] >', params);
    // await this.ailyWikiTable.create(record);
  }
}
