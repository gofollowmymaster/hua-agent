export type AgentSkillType = 'system' | 'user';

export interface AgentSystemSkill {
  key: string;
  type: 'system';
  name: string;
  description: string;
  instruction: string;
  isEnabled: true;
  readonly: true;
}

export interface AgentUserSkillItem {
  id: number;
  type: 'user';
  name: string;
  description: string;
  instruction: string;
  isEnabled: boolean;
  readonly: false;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentSkillInstruction {
  key: string;
  type: AgentSkillType;
  name: string;
  instruction: string;
}
