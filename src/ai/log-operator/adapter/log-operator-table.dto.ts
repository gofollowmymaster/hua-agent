import { Environment } from '../dto/log-operator.dto';

export interface LogOperatorTableDto {
  ID: string;
  操作用户: string;
  供应商: string;
  环境?: Environment;
  备注?: string;
}
