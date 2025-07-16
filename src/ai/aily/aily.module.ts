import { Module } from '@nestjs/common';
import { AilyService } from './aily.service';
import { AilyController } from './aily.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [AilyService],
  controllers: [AilyController],
})
export class AilyModule {}
