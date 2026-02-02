export type CardDataType<T> = {
  type: 'template';
  data: {
    template_id: string;
    template_version_name: string;
    template_variable: T;
  };
};
export abstract class FeishuCard {
  protected static templateId = '';
  protected static templateVersion = '';

  /**
   * 构建飞卡片消息
   * @param alertInfo
   * @returns
   */
  protected static build(alertInfo: Record<string, any>): string;
  protected static build(
    alertInfo: Record<string, any>,
    toString: false,
  ): CardDataType<Record<string, any>>;

  protected static build(
    alertInfo,
    toString = true,
  ): string | Record<string, any> {
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
    return toString ? JSON.stringify(content) : content;
  }

  buildCardMsg(alertInfo: Record<string, any>): string | Record<string, any> {
    return FeishuCard.build(alertInfo);
  }
}
