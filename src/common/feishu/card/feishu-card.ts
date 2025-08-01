export abstract class FeishuCard {
  protected static AlertTemplateId = '';
  protected static AlertTemplateVersion = '';

  /**
   * 构建飞卡片消息
   * @param alertInfo
   * @returns
   */
  protected static build(alertInfo: Record<string, any>) {
    alertInfo.content = alertInfo.content
      ? alertInfo.content.slice(0, 500)
      : '--';
    const content = {
      type: 'template',
      data: {
        template_id: this.AlertTemplateId,
        template_version_name: this.AlertTemplateVersion,
        template_variable: { ...alertInfo },
      },
    };
    return JSON.stringify(content);
  }
}
