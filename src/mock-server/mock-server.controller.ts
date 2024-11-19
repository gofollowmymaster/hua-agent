import { Body, Controller, Post } from '@nestjs/common';
import { MockServerService } from './mock-server.service';
import { MockServerCreate, MockServerGet } from './dto/mock-server.dto';

@Controller('mock-server')
export class MockServerController {
  constructor(private readonly mockServerService: MockServerService) {}
  @Post('create')
  async createMock(@Body() createParams: MockServerCreate) {
    const res = await this.mockServerService.createMock(createParams);
    return res;
  }
  @Post('get')
  async getMock(@Body() getParams: MockServerGet) {
    const res = await this.mockServerService.getMock(getParams);
    return res;
  }
}
