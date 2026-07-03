import FeishuClient from '../clients/client';
import { FEISHU_CLIENT_ID } from './constants';
import { Inject, Injectable, Scope } from '@nestjs/common';

import FeishuApiHelper from './feishu-api-helper';
import { SkillStartBody, SkillStartPath, SkillStartReturn } from '../type/aily';
import { TenantContext } from '@src/common/service/context/tenant.context';

@Injectable({ scope: Scope.TRANSIENT })
class FeishuAilyHelper extends FeishuApiHelper {
  protected readonly useCache = true;
  protected readonly ttl = 60 * 60 * 24;
  constructor(
    @Inject(FEISHU_CLIENT_ID) protected readonly feishuClient: FeishuClient,
    protected readonly userContext: TenantContext,
  ) {
    super();
  }

  async useAilySkill(
    skill: SkillStartPath,
    data: SkillStartBody,
  ): Promise<SkillStartReturn> {
    return await this.requestWrapper(
      async () =>
        await this.client.aily.v1.appSkill.start({
          data,
          path: skill,
        }),
      'useAilySkill:' + skill.app_id,
    );
  }
}

export default FeishuAilyHelper;
