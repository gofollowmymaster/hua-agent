function camelToSnake(str) {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

export function toSnakeCase(obj) {
  if (Array.isArray(obj)) {
    return obj.map(toSnakeCase);
  }

  if (obj !== null && typeof obj === 'object') {
    const result = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const snakeKey = camelToSnake(key);
        result[snakeKey] = toSnakeCase(obj[key]);
      }
    }
    return result;
  }

  return obj;
}
