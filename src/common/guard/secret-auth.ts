import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import ClientSecretTable from '../table/client-secret-table';
import { ConfigService } from '@nestjs/config';
import FeishuTableHelper from '../feishu/hepler/table-helper';
import { ClientFactory, FeishuApp } from '../feishu/clients';

@Injectable()
export class SecretAuthGuard implements CanActivate {
  private clientSecretTable: ClientSecretTable;
  constructor(private config: ConfigService) {
    this.clientSecretTable = new ClientSecretTable(
      this.config,
      new FeishuTableHelper(ClientFactory.create(FeishuApp.AilyAplusClient)),
    );
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      await this.verify(token);
    } catch (err) {
      throw new UnauthorizedException(err.message);
    }
    return true;
  }
  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private async verify(token: string) {
    const {
      record: { fields: appInfo },
    } = await this.clientSecretTable.get(token);
    // return true;

    // Compare the generated signature with the provided signature
    if (!appInfo.AppID) {
      throw new UnauthorizedException();
    }
    return true;
  }
}
