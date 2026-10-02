import { Module } from '@nestjs/common';
import { AuthGuard } from './auth';
import { SecretAuthGuard } from './secret-auth';
import { CompositeAuthOrSecretGuard } from './composite-auth';

@Module({
  providers: [AuthGuard, SecretAuthGuard, CompositeAuthOrSecretGuard],
  exports: [AuthGuard, SecretAuthGuard, CompositeAuthOrSecretGuard],
})
export class GuardModule {}
