import FeishuClient from '../clients/client';
// import { ConfigService } from '@nestjs/config';
import { FEISHU_CLIENT_ID } from './constants';
import { Inject, Injectable, Scope } from '@nestjs/common';

import FeishuApiHelper from './feishu-api-helper';
import { SkillStartBody, SkillStartPath, SkillStartReturn } from '../type/aily';

@Injectable({ scope: Scope.TRANSIENT })
class FeishuAilyHelper extends FeishuApiHelper {
  protected readonly useCache = true;
  protected readonly ttl = 60 * 60 * 24;
  constructor(
    // private readonly config: ConfigService,
    @Inject(FEISHU_CLIENT_ID) private readonly client: FeishuClient,
  ) {
    super();
  }

  async useAilySkill(
    skill: SkillStartPath,
    data: SkillStartBody,
  ): Promise<SkillStartReturn> {
    return await this.requestWrapper(
      async () =>
        await this.client.client.aily.v1.appSkill.start({
          data,
          path: skill,
        }),
      'useAilySkill:' + skill.app_id,
    );
  }
}

export default FeishuAilyHelper;
