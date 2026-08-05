import { FeedbackType } from '@src/doc/wiki/dto/wiki.dto';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'jsonTypeValidator', async: false })
export class JsonTypeValidator implements ValidatorConstraintInterface {
  validate(value: any): boolean {
    //  去除首尾空格
    const trimmed = value.trim();

    // 快速检查：必须以 [ 开头，以 ] 结尾
    if (!trimmed.startsWith('[') || !trimmed.endsWith(']')) {
      return false;
    }

    try {
      //  解析 JSON
      const parsed = JSON.parse(trimmed);

      //  必须是数组
      if (!Array.isArray(parsed)) {
        return false;
      }

      //  数组长度限制
      if (parsed.length === 0 || parsed.length > 5) {
        return false;
      }

      //  验证每个元素
      const validTypes = Object.values(FeedbackType);
      const allValid = parsed.every(
        (item) => validTypes.includes(item) && typeof item === 'string',
      );

      if (!allValid) {
        return false;
      }

      //  去重检查（可选）
      const uniqueTypes = new Set(parsed);
      if (uniqueTypes.size !== parsed.length) {
        return false; // 不允许重复
      }

      return true;
    } catch {
      // JSON 解析错误
      return false;
    }
  }

  defaultMessage(): string {
    return `type必须是有效的JSON字符串数组`;
  }
}
