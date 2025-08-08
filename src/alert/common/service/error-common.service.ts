import { RedisService } from '@src/common/service/redis/redis.service';
import { AlertEvent } from '../type/alert';
import { ErrorBaseService } from './error-base.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CommonErrorService extends ErrorBaseService {
  constructor(protected readonly redisService: RedisService) {
    super(redisService);
  }

  protected async writeToTable(errorEvent: AlertEvent) {
    console.log('[ errorEvent ] >', errorEvent);
  }

  async updateTable(issue_id: string, recordNew: Record<string, any>) {
    console.log('[ issue_id ] >', issue_id, recordNew);
  }

  async errorHookHandler(errorEvent: AlertEvent) {
    console.log('[ errorEvent ] >', errorEvent);
  }
}
