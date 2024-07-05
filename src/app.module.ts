import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ConfigModule } from '@nestjs/config';
import { SubappModule } from './subapp/subapp.module';
import { VersionModule } from './version/version.module';

@Module({
  imports: [ConfigModule.forRoot(), SubappModule, VersionModule],
  providers: [PrismaService],
})
export class AppModule {}
