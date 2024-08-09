import { Prisma } from '@prisma/client';

export class CreateVersionDto {
  versionName: string;
  versionEntry?: string;
  headerTags?: { tagKey: string; tagValue: string }[];
  subapp: string;
  id?: string;
}

export class VersionDto {
  id: number;
  versionName: string;
  versionEntry: string;
  subappId: string;
}

export type CreateHeaderTagsDto = Prisma.HeaderTagsCreateWithoutVersionInput;
