import { Module } from '@nestjs/common';
import { MockServerService } from './mock-server.service';
import { MockServerController } from './mock-server.controller';

@Module({
  controllers: [MockServerController],
  providers: [MockServerService],
})
export class MockServerModule {}
