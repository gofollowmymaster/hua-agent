import { Module } from '@nestjs/common';
import { AuthGuard } from './auth';
import { SecretAuthGuard } from './secret-auth';
import { CompositeAuthOrSecretGuard } from './composite-auth';
import { SignAuthGuard } from './sign-auth';
import { GlobalAdminGuard } from './global-admin';

@Module({
  providers: [
    AuthGuard,
    SecretAuthGuard,
    SignAuthGuard,
    CompositeAuthOrSecretGuard,
    GlobalAdminGuard,
  ],
  exports: [
    AuthGuard,
    SecretAuthGuard,
    SignAuthGuard,
    CompositeAuthOrSecretGuard,
    GlobalAdminGuard,
  ],
})
export class GuardModule {}
