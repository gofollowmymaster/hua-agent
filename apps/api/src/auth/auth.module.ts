import { Module } from '@nestjs/common';
import { GuardModule } from '@src/common/guard/guard.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SystemAdminGuard } from './system-admin.guard';
import { UsersController } from './users.controller';

/** 装配本地用户认证和系统管理员用户管理能力。 */
@Module({
  imports: [GuardModule],
  controllers: [AuthController, UsersController],
  providers: [AuthService, SystemAdminGuard],
})
export class AuthModule {}
