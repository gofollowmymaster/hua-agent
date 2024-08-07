import { Prisma } from '@prisma/client';

export class CreateVersionDto {
  versionName: string;
  versionEntry?: string;
  headerTags?: { reqKey: string; reqValue: string }[];
  headerTagsId?: string;
  subappId: string;
  id?: string;
}

export class VersionDto {
  id: number;
  versionName: string;
  versionEntry: string;
  subappId: string;
}

export type CreateHeaderTagsDto = Prisma.HeaderTagsCreateWithoutVersionInput;
