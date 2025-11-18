import { Injectable } from '@nestjs/common';
import FeishuClient from './client';
import { FeishuAppClentsType } from '.';

@Injectable()
class AuthClient extends FeishuClient {
  // private readonly instance;

  constructor() {
    super(AuthClient.name as FeishuAppClentsType);
  }
}

export default AuthClient;
