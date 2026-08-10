import eslint from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginVue from 'eslint-plugin-vue';
import globals from 'globals';
import typescriptEslint from 'typescript-eslint';
import vueParser from 'vue-eslint-parser';

export default typescriptEslint.config(
  {
    ignores: ['node_modules', 'dist', 'public', '*.cjs']
  },

  /** js推荐配置 */
  eslint.configs.recommended,
  /** ts推荐配置 */
  ...typescriptEslint.configs.recommended,
  /** vue推荐配置 */
  ...eslintPluginVue.configs['flat/recommended'],

  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        Recordable: 'readonly'
      },
      ecmaVersion: 'latest'
    }
  },
  {
    files: ['**/*.{ts,tsx,vue}'],
    rules: {
      '@typescript-eslint/no-unused-expressions': 'off',
      'no-case-declarations': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
      'no-empty': 'off',
      'no-undef': 'off',

      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_|^t$',
          caughtErrors: 'none',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_'
        }
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
                '禁止在管理后台使用 antdv Table 系列组件，表格请使用 @aplus-frontend/ui 的 AgGrid（参考 apps/rag-admin/standard/development/table-pattern.md）'
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
                '禁止在管理后台使用 antdv Table 系列类型，表格列请使用 AgGridColumnType（参考 apps/rag-admin/standard/development/table-pattern.md）'
            }
          ]
        }
      ],
      'no-unused-vars': 'off',
      '@typescript-eslint/ban-ts-comment': 'off'
    }
  },

  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        sourceType: 'module',
        parser: typescriptEslint.parser,
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    rules: {
      'vue/no-mutating-props': [
        'error',
        {
          shallowOnly: true
        }
      ],
      'vue/custom-event-name-casing': 'off',
      'vue/no-watch-after-await': 'error',
      'vue/no-use-v-else-with-v-for': 'error',
      'vue/no-unused-refs': 'error',
      'vue/require-v-for-key': 'error',
      'vue/no-useless-template-attributes': 'error',
      'vue/no-template-key': 'error',
      'vue/no-undef-components': [
        'error',
        {
          ignorePatterns: []
        }
      ],
      'vue/attributes-order': 'off',
      'vue/one-component-per-file': 'off',
      'vue/html-closing-bracket-newline': 'off',
      'vue/max-attributes-per-line': 'off',
      'vue/multiline-html-element-content-newline': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/require-default-prop': 'off',
      'vue/html-self-closing': [
        'error',
        {
          html: {
            void: 'always',
            normal: 'never',
            component: 'always'
          },
          svg: 'always',
          math: 'always'
        }
      ],
      'vue/multi-word-component-names': 'off',
      'vue/no-reserved-component-names': 'off',
      'vue/component-definition-name-casing': ['error', 'kebab-case'],

      '@typescript-eslint/no-explicit-any': 'off'
    }
  },

  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        parser: typescriptEslint.parser,
        extraFileExtensions: ['.vue'],
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-empty-function': 'error',
      'no-use-before-define': 'off',
      'no-prototype-builtins': 'off',
      '@typescript-eslint/no-use-before-define': [
        'error',
        { functions: false }
      ],
      '@typescript-eslint/no-shadow': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/ban-ts-ignore': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/ban-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-this-alias': 'off',
      'space-before-function-paren': 'off'
    }
  },
  eslintConfigPrettier
);
