import { ConfigService } from '@nestjs/config';
import { LoggerService } from '../service/logger/logger.service';

export abstract class BaseService {
  protected readonly logger: LoggerService;
  protected readonly config: ConfigService;
  constructor() {}
}
