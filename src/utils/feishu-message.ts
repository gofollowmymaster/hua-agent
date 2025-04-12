const AlertTemplateId = 'AAqSyNBCovM2j';
const AlertTemplateVersion = '1.0.8';
type AlertInfo = {
  project: string;
  level?: string;
  errorMessage: string;
  url?: string;
  userId?: string;
  errorTime: string;
  title: string;
  color: string;
  [key: string]: any;
};
/**
 * 构建飞书报警卡片消息
 * @param alertInfo
 * @returns
 */
export const buildFeishuTemplateCardMsg = (alertInfo: AlertInfo) => {
  // const AtUser = userId ? `<at user_id="${userId}"></at>` : '';

  const color = alertInfo.level == 'fatal' ? 'red' : 'orange';
  const content = {
    type: 'template',
    data: {
      template_id: AlertTemplateId,
      template_version_name: AlertTemplateVersion,
      template_variable: { ...alertInfo, color },
    },
  };
  return JSON.stringify(content);
};

export const buildAtUserMsg = (data: Record<string, any>, userId: string) => {
  const AtUser = userId ? `<at user_id="${userId}"></at>` : '';
  const content = {
    text: `${AtUser}`,
  };
  return JSON.stringify(content);
};
