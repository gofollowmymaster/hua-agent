import { Injectable } from '@nestjs/common';
import FeishuClient from './client';
import { FeishuAppClientsType } from '.';

@Injectable()
class AuthClient extends FeishuClient {
  // private readonly instance;

  constructor() {
    super(AuthClient.name as FeishuAppClientsType);
  }
}

export default AuthClient;
