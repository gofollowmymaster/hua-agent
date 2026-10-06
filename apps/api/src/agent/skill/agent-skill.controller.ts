import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@src/common/guard/auth';
import {
  CreateUserSkillDto,
  QuerySystemSkillDto,
  QueryUserSkillDto,
  UpdateUserSkillDto,
} from './dto/agent-skill.dto';
import { AgentSkillService } from './agent-skill.service';

/** 提供系统 Skill 查询和当前用户私有 Skill 管理接口。 */
@ApiTags('业务 Agent Skill')
@Controller('agent/skills')
@UseGuards(AuthGuard)
export class AgentSkillController {
  constructor(private readonly agentSkillService: AgentSkillService) {}

  /** 返回代码预置的只读系统 Skill。 */
  @Get('system')
  @ApiOperation({ summary: '查询系统 Skill' })
  listSystemSkills(@Query() query: QuerySystemSkillDto) {
    return this.agentSkillService.listSystemSkills(query);
  }

  /** 分页返回当前登录用户的 Skill。 */
  @Post('user/page')
  @ApiOperation({ summary: '分页查询用户 Skill' })
  @ApiBody({ type: QueryUserSkillDto })
  pageUserSkills(@Body() body: QueryUserSkillDto) {
    return this.agentSkillService.pageUserSkills(body);
  }

  /** 创建当前登录用户的 Skill。 */
  @Post('user')
  @ApiOperation({ summary: '创建用户 Skill' })
  @ApiBody({ type: CreateUserSkillDto })
  createUserSkill(@Body() body: CreateUserSkillDto) {
    return this.agentSkillService.createUserSkill(body);
  }

  /** 修改或启停当前登录用户的 Skill。 */
  @Post('user/:id')
  @ApiOperation({ summary: '修改用户 Skill' })
  @ApiBody({ type: UpdateUserSkillDto })
  updateUserSkill(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateUserSkillDto,
  ) {
    return this.agentSkillService.updateUserSkill(id, body);
  }

  /** 删除当前登录用户的 Skill。 */
  @Delete('user/:id')
  @ApiOperation({ summary: '删除用户 Skill' })
  deleteUserSkill(@Param('id', ParseIntPipe) id: number) {
    return this.agentSkillService.deleteUserSkill(id);
  }
}
