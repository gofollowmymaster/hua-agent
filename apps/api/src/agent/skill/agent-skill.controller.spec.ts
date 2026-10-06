import {
  GUARDS_METADATA,
  METHOD_METADATA,
  PATH_METADATA,
} from '@nestjs/common/constants';
import { RequestMethod } from '@nestjs/common';
import { AuthGuard } from '@src/common/guard/auth';
import { AgentSkillController } from './agent-skill.controller';

describe('AgentSkillController', () => {
  const skillService = {
    listSystemSkills: jest.fn(),
    pageUserSkills: jest.fn(),
    createUserSkill: jest.fn(),
    updateUserSkill: jest.fn(),
    deleteUserSkill: jest.fn(),
  };
  const controller = new AgentSkillController(skillService as any);

  beforeEach(() => jest.clearAllMocks());

  it.each([
    ['listSystemSkills', 'system', RequestMethod.GET],
    ['pageUserSkills', 'user/page', RequestMethod.POST],
    ['createUserSkill', 'user', RequestMethod.POST],
    ['updateUserSkill', 'user/:id', RequestMethod.POST],
    ['deleteUserSkill', 'user/:id', RequestMethod.DELETE],
  ] as const)('maps %s to /agent/skills/%s', (method, path, requestMethod) => {
    const handler = AgentSkillController.prototype[method];
    expect(Reflect.getMetadata(PATH_METADATA, handler)).toBe(path);
    expect(Reflect.getMetadata(METHOD_METADATA, handler)).toBe(requestMethod);
  });

  it('requires bearer authentication', () => {
    expect(Reflect.getMetadata(PATH_METADATA, AgentSkillController)).toBe(
      'agent/skills',
    );
    expect(Reflect.getMetadata(GUARDS_METADATA, AgentSkillController)).toEqual([
      AuthGuard,
    ]);
  });

  it('delegates user mutations to the service', () => {
    const create = { name: '日报', instruction: '生成日报' };
    const update = { isEnabled: false };
    controller.createUserSkill(create);
    controller.updateUserSkill(2, update);
    controller.deleteUserSkill(2);
    expect(skillService.createUserSkill).toHaveBeenCalledWith(create);
    expect(skillService.updateUserSkill).toHaveBeenCalledWith(2, update);
    expect(skillService.deleteUserSkill).toHaveBeenCalledWith(2);
  });
});
