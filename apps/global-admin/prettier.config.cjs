/** @type {import('prettier').Config} */
module.exports = {
  printWidth: 80,
  semi: true,
  vueIndentScriptAndStyle: true,
  singleQuote: true,
  trailingComma: 'none',
  proseWrap: 'never',
  bracketSpacing: true,
  arrowParens: 'always',
  htmlWhitespaceSensitivity: 'strict',
  endOfLine: 'lf',
  plugins: ['prettier-plugin-packagejson']
};
