import type { Config } from 'jest';
import { pathsToModuleNameMapper } from 'ts-jest';
import { compilerOptions } from './tsconfig.json'; // 注意这行

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  // rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: './coverage',

  preset: 'ts-jest',
  testEnvironment: 'node',
  clearMocks: true,
  collectCoverage: true,
  roots: ['<rootDir>/'],
  moduleDirectories: ['node_modules', '<rootDir>'],

  // 关键：自动把 tsconfig.json 的 paths 映射给 Jest
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths ?? {}, {
    prefix: '<rootDir>/', // 这一行非常关键！
  }),

  // 如果你还有手动写的别名（比如 @common），可以继续追加
  // '^@common/(.*)$': '<rootDir>/src/common/$1',
};

export default config;
