import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { createHash } from 'crypto';
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
    const data = request.body;

    try {
      await this.verify(data);
    } catch (err) {
      throw new UnauthorizedException(err.message);
    }
    return true;
  }

  private async verify(data: Record<string, string>) {
    const { signature, appId, ...restData } = data;

    if (!signature) {
      throw new UnauthorizedException('has no signature');
    }
    if (!appId) {
      throw new UnauthorizedException('has no appId');
    }
    console.log('[ this.clientSecretTable ] >', this.clientSecretTable);
    const appInfo = await this.clientSecretTable.get(appId);

    const secretKey = appInfo.AppSecret; // Replace with your actual secret key

    // Sort keys and construct the string
    const sortedKeys = Object.keys(restData).sort();
    const concatenatedString = sortedKeys
      .map((key) => `${key}=${restData[key]}`)
      .join('&');

    // Append the secret key
    const stringToHash = concatenatedString + secretKey;

    // Generate MD5 hash
    const generatedSignature = createHash('md5')
      .update(stringToHash)
      .digest('hex');

    // Compare the generated signature with the provided signature
    if (generatedSignature !== signature) {
      throw new UnauthorizedException();
    }
    return true;
  }
}
