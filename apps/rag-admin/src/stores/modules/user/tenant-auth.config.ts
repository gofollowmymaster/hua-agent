export type AuthEnv = 'dev' | 'development' | 'test' | 'uat' | 'prod';

export type TenantSupplierCode = 'A' | 'C' | 'D';

export interface TenantAuthConfig {
  supplierCode: TenantSupplierCode;
  hostSuffixes: readonly string[];
  redirectUrls: Readonly<Record<AuthEnv, string>>;
  authEnv: AuthEnv;
  loginUrl: string;
}

type TenantAuthDefinition = Omit<TenantAuthConfig, 'authEnv' | 'loginUrl'>;

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
    }
  }
];

const defaultTenant = tenantAuthDefinitions.find(
  ({ supplierCode }) => supplierCode === 'C'
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
    loginUrl: definition.redirectUrls[authEnv]
  };
}
