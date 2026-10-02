import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@src/common/guard/auth';
import { AuthService } from './auth.service';
import {
  CreateRagAdminUserDto,
  QueryRagAdminUserDto,
  ResetRagAdminUserPasswordDto,
  UpdateRagAdminUserDto,
} from './dto/auth.dto';
import { SystemAdminGuard } from './system-admin.guard';

/** 提供仅限系统管理员的当前租户用户管理接口。 */
@ApiTags('auth-users')
@Controller('auth/users')
@UseGuards(AuthGuard, SystemAdminGuard)
export class UsersController {
  constructor(private readonly authService: AuthService) {}

  /** 分页返回当前租户用户。 */
  @Post('page')
  @ApiBody({ type: QueryRagAdminUserDto })
  list(@Body() dto: QueryRagAdminUserDto) {
    return this.authService.listUsers(dto);
  }

  /** 创建当前租户普通用户。 */
  @Post()
  @ApiBody({ type: CreateRagAdminUserDto })
  create(@Body() dto: CreateRagAdminUserDto) {
    return this.authService.createUser(dto);
  }

  /** 更新当前租户用户的可变资料。 */
  @Post(':id')
  @ApiBody({ type: UpdateRagAdminUserDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRagAdminUserDto,
  ) {
    return this.authService.updateUser(id, dto);
  }

  /** 重置当前租户用户的登录密码。 */
  @Post(':id/password')
  @ApiBody({ type: ResetRagAdminUserPasswordDto })
  resetPassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ResetRagAdminUserPasswordDto,
  ) {
    return this.authService.resetUserPassword(id, dto);
  }
}
