import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
    }),
    HttpModule,
  ],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
