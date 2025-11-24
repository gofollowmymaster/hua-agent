import { LoggerService } from '../service/logger/logger.service';

export abstract class BaseService {
  protected readonly logger: LoggerService;
  constructor() {}
}
