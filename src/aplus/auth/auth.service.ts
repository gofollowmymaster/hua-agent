import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

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
}
