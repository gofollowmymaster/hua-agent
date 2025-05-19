export interface ApiAlertTableDto {
  接口地址: string;
  http状态码: string;
  业务状态码: string;
  请求参数: string;
  响应数据: string;
  错误信息: string;
  业务线: [string];
  应用名: string;
  模块?: string;
  业务端?: string;
  发生时间: number;
  环境: string;
  RawData: string;
}

export interface FrontendAlertTableDto {
  标题: string;
  链接信息: string;
  是否解决: boolean;
  // 优先级: ;
  负责人: { id: string }[];
  错误原因: string;
  解决方案: string;
  来源: string;
  报警级别: string;
  描述信息: string;
  应用名: [string];
  业务线: [string];
  环境: string;
  RawData: string;
}
// interface FeishuUser {
//   id: string;
// }
// interface FeishuGroup {
//   id: string;
// }
