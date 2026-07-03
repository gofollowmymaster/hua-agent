import { Module } from '@nestjs/common';
import { AuthGuard } from './auth';
import { SecretAuthGuard } from './secret-auth';
import { CompositeAuthOrSecretGuard } from './composite-auth';
import { SignAuthGuard } from './sign-auth';

@Module({
  providers: [
    AuthGuard,
    SecretAuthGuard,
    SignAuthGuard,
    CompositeAuthOrSecretGuard,
  ],
  exports: [
    AuthGuard,
    SecretAuthGuard,
    SignAuthGuard,
    CompositeAuthOrSecretGuard,
  ],
})
export class GuardModule {}
