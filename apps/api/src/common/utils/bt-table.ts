import { BitTableCreateRecordField } from '../feishu/type/bitable';

export const transformTableField = (item: BitTableCreateRecordField) => {
  if (['string', 'number', 'boolean'].includes(typeof item)) {
    return item;
  } else if (Array.isArray(item)) {
    const first = item[0];
    if (typeof first === 'object' && first !== null && 'type' in first) {
      return item.reduce((prev, next) => {
        return prev + (next as any).text;
      }, '');
    } else {
      return item;
    }
  } else {
    return item;
  }
};
