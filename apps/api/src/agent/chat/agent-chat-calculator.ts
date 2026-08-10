/** 安全计算简单四则运算表达式，支持数字、括号和一元负号。 */
export function calculateExpression(expression: string): number {
  const source = expression.trim();
  if (!source || source.length > 200) {
    throw new Error('invalid expression');
  }

  let index = 0;

  function skipSpaces() {
    while (source[index] === ' ' || source[index] === '\t') index += 1;
  }

  function parseNumber(): number {
    skipSpaces();
    const start = index;
    while (/[0-9.]/.test(source[index] ?? '')) index += 1;
    const raw = source.slice(start, index);
    if (!raw || !/^\d+(\.\d+)?$/.test(raw)) {
      throw new Error('invalid expression');
    }
    return Number(raw);
  }

  function parseFactor(): number {
    skipSpaces();
    if (source[index] === '-') {
      index += 1;
      return -parseFactor();
    }
    if (source[index] === '(') {
      index += 1;
      const value = parseExpression();
      skipSpaces();
      if (source[index] !== ')') {
        throw new Error('invalid expression');
      }
      index += 1;
      return value;
    }
    return parseNumber();
  }

  function parseTerm(): number {
    let value = parseFactor();
    for (;;) {
      skipSpaces();
      const operator = source[index];
      if (operator === '*') {
        index += 1;
        value *= parseFactor();
        continue;
      }
      if (operator === '/') {
        index += 1;
        const divisor = parseFactor();
        if (divisor === 0) {
          throw new Error('division by zero');
        }
        value /= divisor;
        continue;
      }
      return value;
    }
  }

  function parseExpression(): number {
    let value = parseTerm();
    for (;;) {
      skipSpaces();
      const operator = source[index];
      if (operator === '+') {
        index += 1;
        value += parseTerm();
        continue;
      }
      if (operator === '-') {
        index += 1;
        value -= parseTerm();
        continue;
      }
      return value;
    }
  }

  const result = parseExpression();
  skipSpaces();
  if (index !== source.length) {
    throw new Error('invalid expression');
  }
  return result;
}
