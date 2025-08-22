export abstract class FeishuCard {
  protected static templateId = '';
  protected static templateVersion = '';

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
        template_id: this.templateId,
        template_version_name: this.templateVersion,
        template_variable: { ...alertInfo },
      },
    };
    console.log('[ alertInfo ] >', alertInfo);
    return JSON.stringify(content);
  }
}
