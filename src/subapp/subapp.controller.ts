import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { SubappService } from './subapp.service';
import { Prisma, Subapp as SubappModel } from '@prisma/client';

@Controller('subapp')
export class SubappController {
  constructor(private readonly subappService: SubappService) {}

  @Post()
  async create(
    @Body() createSubappDto: Prisma.SubappCreateInput,
  ): Promise<SubappModel> {
    return this.subappService.createSubapp(createSubappDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<SubappModel> {
    return this.subappService.findSubapp({ id: Number(id) });
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: Prisma.SubappUpdateInput) {
    return this.subappService.updateSubapp({
      where: { id: Number(id) },
      data,
    });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subappService.delSubapp({ id: Number(id) });
  }
}
