import { calculateExpression } from './agent-chat-calculator';

describe('agent-chat-calculator', () => {
  it('calculates basic arithmetic expressions', () => {
    expect(calculateExpression('1+2*3')).toBe(7);
    expect(calculateExpression('(1+2)*3')).toBe(9);
    expect(calculateExpression('-2+5')).toBe(3);
    expect(calculateExpression('10/4')).toBe(2.5);
  });

  it('rejects invalid or dangerous expressions', () => {
    expect(() => calculateExpression('1/0')).toThrow('division by zero');
    expect(() => calculateExpression('1+')).toThrow('invalid expression');
    expect(() => calculateExpression('process.exit()')).toThrow(
      'invalid expression',
    );
  });
});
