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
import { RedisService } from '../service/redis/redis.service';

@Injectable()
export class SignAuthGuard implements CanActivate {
  private clientSecretTable: ClientSecretTable;
  constructor(
    private config: ConfigService,
    private redisService: RedisService,
  ) {
    this.clientSecretTable = new ClientSecretTable(
      this.config,
      new FeishuTableHelper(
        ClientFactory.create(FeishuApp.AilyAplusClient),
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
      const {
        record: { fields: appInfo },
      } = await this.clientSecretTable.get(restData.appId);
      if (!appInfo.是否启用) {
        throw new UnauthorizedException();
      }
      // return true;
      const secretKey = appInfo?.AppSecret; // Replace with your actual secret key
      // Sort keys and construct the string
      const sortedKeys = Object.keys(restData).sort();
      const concatenatedString = sortedKeys
        .map((key) => `${key}=${restData[key]}`)
        .join('&');

      // Append the secret key
      const stringToHash = concatenatedString + secretKey;
      console.log('[ signature ] >', stringToHash);

      // Generate MD5 hash
      generatedSignature = createHash('md5').update(stringToHash).digest('hex');
    } catch (error) {
      console.log('[ error ] >', error);
      throw new UnauthorizedException();
    }
    console.log('[ signature ] >', signature, generatedSignature);

    // Compare the generated signature with the provided signature
    if (generatedSignature !== signature) {
      throw new UnauthorizedException('Signature mismatch');
    }
    return true;
  }
}
