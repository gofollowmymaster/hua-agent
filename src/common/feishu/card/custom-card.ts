export const buildcommonCardMsg = (title: string, content: string) => {
  const info = {
    schema: '2.0',
    config: {},
    card_link: {},
    header: {
      tag: 'plain_text', // 文本类型的标签。可选值：plain_text 和 lark_md。
      content: title, // 标题内容。
    },
    body: {
      elements: [
        {
          tag: 'div',
          text: {
            tag: 'plain_text',
            content: content,
          },
        },
      ],
    },
  };
  return JSON.stringify(info);
};
