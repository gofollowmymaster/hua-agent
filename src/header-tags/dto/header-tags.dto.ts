import { Prisma } from '@prisma/client';

export class VersionDto {
  id: number;
  versionName: string;
  versionEntry: string;
  subappId: string;
}

export type CreateHeaderTagsDto = Prisma.HeaderTagsCreateWithoutVersionInput & {
  versionId: string;
};
