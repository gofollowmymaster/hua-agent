import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { createHash } from 'crypto';
import ClientSecretTable from '../table/client-secret-table';
import FeishuTableHelper from '../feishu/hepler/table-helper';
import { ClientFactory, FeishuApp } from '../feishu/clients';
import { RedisService } from '../service/redis/redis.service';
import { TenantContext } from '../service/context/tenant.context';

const generateSign = (data: Record<string, string>, secretKey: string) => {
  const sortedKeys = Object.keys(data).sort();
  const concatenatedString = sortedKeys
    .map((key) => `${key}=${data[key]}`)
    .join('&');

  // Append the secret key
  const stringToHash = concatenatedString + secretKey;

  // Generate MD5 hash
  return createHash('md5').update(stringToHash).digest('hex');
};
@Injectable()
export class SignAuthGuard implements CanActivate {
  private clientSecretTable: ClientSecretTable;
  constructor(
    private redisService: RedisService,
    protected readonly userContext: TenantContext,
  ) {
    this.clientSecretTable = new ClientSecretTable(
      new FeishuTableHelper(
        ClientFactory.create(FeishuApp.AilyAplusClient),
        userContext,
        redisService,
      ),
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
    const { signature, ...restData } = data;

    if (!signature) {
      throw new UnauthorizedException('has no signature');
    }
    if (!restData.appId) {
      throw new UnauthorizedException('has no appId');
    }
    let generatedSignature;
    try {
      const { fields: appInfo } = await this.clientSecretTable.get(
        restData.appId,
      );
      if (!appInfo.是否启用) {
        throw new UnauthorizedException();
      }
      const secretKey = appInfo?.AppSecret as string; // Replace with your actual secret key

      // Generate MD5 hash
      generatedSignature = generateSign(restData, secretKey);
    } catch (error) {
      console.log('[ error ] >', error);
      throw new UnauthorizedException();
    }

    // Compare the generated signature with the provided signature
    if (generatedSignature !== signature) {
      throw new UnauthorizedException('Signature mismatch');
    }
    return true;
  }
}
