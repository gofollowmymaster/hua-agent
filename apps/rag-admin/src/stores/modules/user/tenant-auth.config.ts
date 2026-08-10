export type AuthEnv = 'dev' | 'development' | 'test' | 'uat' | 'prod';

export type TenantSupplierCode = 'A' | 'C' | 'D';

export const TENANT_DISPLAY_NAMES: Readonly<
  Record<TenantSupplierCode, string>
> = {
  A: 'Aplus',
  C: '小往',
  D: 'Yurex'
};

export interface TenantAuthConfig {
  supplierCode: TenantSupplierCode;
  hostSuffixes: readonly string[];
  redirectUrls: Readonly<Record<AuthEnv, string>>;
  apiUrls: Readonly<Record<AuthEnv, string>>;
  authEnv: AuthEnv;
  loginUrl: string;
  apiUrl: string;
}

type TenantAuthDefinition = Omit<
  TenantAuthConfig,
  'authEnv' | 'loginUrl' | 'apiUrl'
>;

const tenantAuthDefinitions: readonly TenantAuthDefinition[] = [
  {
    supplierCode: 'A',
    hostSuffixes: [
      'aplnk.com',
      'dev-v2.elnkpro.com',
      'test-xw.elnkpro.com',
      'uat.elnkpro.com'
    ],
    redirectUrls: {
      development: 'http://auth.dev-v2.elnkpro.com/admin.html#/',
      dev: 'http://auth.dev-v2.elnkpro.com/admin.html#/',
      test: 'https://auth.test-xw.elnkpro.com/admin.html#/',
      uat: 'https://auth.uat.elnkpro.com/admin.html#/',
      prod: 'https://auth.aplnk.com/admin.html#/'
    },
    apiUrls: {
      development: '',
      dev: 'http://api.dev-v2.elnkpro.com',
      test: 'https://api.test-com.elnkpro.com',
      uat: 'https://api.uat.elnkpro.com',
      prod: 'https://api.aplnk.com'
    }
  },
  {
    supplierCode: 'C',
    hostSuffixes: ['clouboat.com', 'test-com.elnkpro.com'],
    redirectUrls: {
      development: 'http://auth.dev-v2.clouboat.com/admin.html#/',
      dev: 'http://auth.dev-v2.clouboat.com/admin.html#/',
      test: 'https://auth.test-com.elnkpro.com/admin.html#/',
      uat: 'https://auth.uat-cb.clouboat.com/admin.html#/',
      prod: 'https://auth.clouboat.com/admin.html#/'
    },
    apiUrls: {
      development: '',
      dev: 'http://api.dev-v2.elnkpro.com',
      test: 'https://api.test-com.elnkpro.com',
      uat: 'https://api.uat-cb.clouboat.com',
      prod: 'https://api.clouboat.com'
    }
  },
  {
    supplierCode: 'D',
    hostSuffixes: ['yurexcc.com'],
    redirectUrls: {
      development: 'http://auth.dev-v2.yurexcc.com/admin.html#/',
      dev: 'http://auth.dev-v2.yurexcc.com/admin.html#/',
      test: 'https://auth.test.yurexcc.com/admin.html#/',
      uat: 'https://auth.uat.yurexcc.com/admin.html#/',
      prod: 'https://auth.yurexcc.com/admin.html#/'
    },
    apiUrls: {
      development: '',
      dev: 'http://api.dev-v2.elnkpro.com',
      test: 'https://api.test-com.elnkpro.com',
      uat: 'https://api.uat.yurexcc.com',
      prod: 'https://api.yurexcc.com'
    }
  }
];

const defaultTenant = tenantAuthDefinitions.find(
  ({ supplierCode }) => supplierCode === 'D'
)!;

export function resolveAuthEnv(authEnv?: string, viteMode?: string): AuthEnv {
  const candidate = (
    authEnv?.trim() ||
    viteMode?.trim() ||
    'dev'
  ).toLowerCase();

  if (candidate === 'production') return 'prod';
  if (
    candidate === 'dev' ||
    candidate === 'development' ||
    candidate === 'test' ||
    candidate === 'uat' ||
    candidate === 'prod'
  ) {
    return candidate;
  }

  return 'dev';
}

function matchesHostSuffix(hostname: string, suffix: string) {
  return hostname === suffix || hostname.endsWith(`.${suffix}`);
}

export function resolveTenantAuthConfig(
  hostname: string,
  authEnv: AuthEnv
): TenantAuthConfig {
  const normalizedHostname = hostname.trim().toLowerCase().replace(/\.$/, '');
  const definition =
    tenantAuthDefinitions.find(({ hostSuffixes }) =>
      hostSuffixes.some((suffix) =>
        matchesHostSuffix(normalizedHostname, suffix)
      )
    ) ?? defaultTenant;

  return {
    ...definition,
    authEnv,
    loginUrl: definition.redirectUrls[authEnv],
    apiUrl: definition.apiUrls[authEnv]
  };
}

/** 将服务商编码转换为展示用的租户名，未匹配时返回空。 */
export function resolveTenantDisplayName(supplierCode?: string) {
  if (!supplierCode) return undefined;
  return TENANT_DISPLAY_NAMES[supplierCode as TenantSupplierCode];
}
