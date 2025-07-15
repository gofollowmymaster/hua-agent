import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ClientFactory, FeishuApp } from '@src/common/feishu/clients';
import { FeishuApiException } from '@src/common/exception/feishu-api-exception';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { RedisKeys } from '@src/common/const/redis-key.enum';

// import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(@Inject(CACHE_MANAGER) protected cache: Cache) {}

  async signIn(username: string, pass: string): Promise<any> {
    console.log('[ username ] >', username, pass);
    // const user = await this.usersService.findOne(username);
    // if (user?.password !== pass) {
    throw new UnauthorizedException();
    // }
    // const { password, ...result } = user;
    // TODO: Generate a JWT and return it here
    // instead of the user object
    // return result;
  }
  async getToken(): Promise<string> {
    const client = ClientFactory.create(FeishuApp.AilyAplusClient);
    const res = await client.client.authen.accessToken.create({
      data: {
        grant_type: 'authorization_code',
        code: 'fyylC5473ACC4G3xF9KG5xK4eIc3BD06',
      },
    });
    console.log('[ res ] >', res);

    if (res.code !== 0) {
      throw new FeishuApiException();
    }

    this.cache.set(RedisKeys.FEISHU_FIXED_ACCESS_TOKEN, res.data);
    return '4KClx8a29zAF4H23Gxc95Aw0adDBa6w6';
  }
}
