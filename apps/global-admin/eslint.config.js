import eslint from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginVue from 'eslint-plugin-vue';
import globals from 'globals';
import typescriptEslint from 'typescript-eslint';
import vueParser from 'vue-eslint-parser';

export default typescriptEslint.config(
  { ignores: ['node_modules', 'dist', 'public', '*.cjs'] },
  eslint.configs.recommended,
  ...typescriptEslint.configs.recommended,
  ...eslintPluginVue.configs['flat/recommended'],
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      ecmaVersion: 'latest'
    }
  },
  {
    files: ['**/*.{ts,tsx,vue}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
      ],
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@aplus-frontend/antdv',
              importNames: [
                'Table',
                'TableColumn',
                'TableColumnGroup',
                'TableSummary',
                'TableSummaryRow',
                'TableSummaryCell'
              ],
              message:
                '禁止在管理后台使用 antdv Table 系列组件，表格请使用 @aplus-frontend/ui 的 AgGrid（参考 apps/global-admin/standard/architecture/custom/table-pattern.md）'
            },
            {
              name: '@aplus-frontend/antdv',
              importNames: [
                'TableProps',
                'TableColumnsType',
                'TableColumnType',
                'TableColumnGroupType',
                'TableColumnProps',
                'TablePaginationConfig'
              ],
              message:
                '禁止在管理后台使用 antdv Table 系列类型，表格列请使用 AgGridColumnType（参考 apps/global-admin/standard/architecture/custom/table-pattern.md）'
            }
          ]
        }
      ],
      'no-unused-vars': 'off',
      'no-undef': 'off'
    }
  },
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        sourceType: 'module',
        parser: typescriptEslint.parser,
        extraFileExtensions: ['.vue']
      }
    },
    rules: {
      'vue/attributes-order': 'off',
      'vue/html-closing-bracket-newline': 'off',
      'vue/max-attributes-per-line': 'off',
      'vue/multiline-html-element-content-newline': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/require-default-prop': 'off',
      'vue/multi-word-component-names': 'off',
      'vue/no-reserved-component-names': 'off',
      'vue/component-definition-name-casing': ['error', 'kebab-case'],
      'vue/html-self-closing': [
        'error',
        {
          html: { void: 'always', normal: 'never', component: 'always' },
          svg: 'always',
          math: 'always'
        }
      ]
    }
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        parser: typescriptEslint.parser,
        extraFileExtensions: ['.vue']
      }
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-shadow': 'error',
      '@typescript-eslint/no-use-before-define': ['error', { functions: false }]
    }
  },
  eslintConfigPrettier
);
