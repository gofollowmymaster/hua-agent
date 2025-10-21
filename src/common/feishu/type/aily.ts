import * as lark from '@larksuiteoapi/node-sdk';

export type SkillStartParams = Parameters<
  lark.Client['aily']['v1']['appSkill']['start']
>;

export type SkillStartPath = SkillStartParams[0]['path'];
export type SkillStartBody = SkillStartParams[0]['data'];

export type SkillStartReturn = Awaited<
  ReturnType<lark.Client['aily']['v1']['appSkill']['start']>
>['data'];
