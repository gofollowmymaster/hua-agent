const AlertTemplateId = 'AAqSyNBCovM2j';
const AlertTemplateVersion = '1.0.8';
export const buildFeishuTemplateCardMsg = (alertInfo: Record<string, any>) => {
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
  console.log('[ buildFeishuTextMsg ] >', data);
  const content = {
    text: `${AtUser}`,
  };
  return JSON.stringify(content);
};
