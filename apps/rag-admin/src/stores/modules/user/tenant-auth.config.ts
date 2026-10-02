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
  displayName: string;
}

type TenantDefinition = TenantAuthConfig & {
  hostSuffixes: readonly string[];
};

const tenantDefinitions: readonly TenantDefinition[] = [
  {
    supplierCode: 'A',
    displayName: 'Aplus',
    hostSuffixes: [
      'aplnk.com',
      'dev-v2.elnkpro.com',
      'test-xw.elnkpro.com',
      'uat.elnkpro.com'
    ]
  },
  {
    supplierCode: 'C',
    displayName: '小往',
    hostSuffixes: ['clouboat.com', 'test-com.elnkpro.com']
  },
  {
    supplierCode: 'D',
    displayName: 'Yurex',
    hostSuffixes: ['yurexcc.com']
  }
];

const defaultTenant = tenantDefinitions.find(
  ({ supplierCode }) => supplierCode === 'D'
)!;

function matchesHostSuffix(hostname: string, suffix: string) {
  return hostname === suffix || hostname.endsWith(`.${suffix}`);
}

/** 根据当前前端 hostname 解析请求登录 API 所需的服务商码。 */
export function resolveTenantAuthConfig(hostname: string): TenantAuthConfig {
  const normalizedHostname = hostname.trim().toLowerCase().replace(/\.$/, '');
  const definition =
    tenantDefinitions.find(({ hostSuffixes }) =>
      hostSuffixes.some((suffix) =>
        matchesHostSuffix(normalizedHostname, suffix)
      )
    ) ?? defaultTenant;

  return {
    supplierCode: definition.supplierCode,
    displayName: definition.displayName
  };
}

/** 将服务商编码转换为展示用的租户名，未匹配时返回空。 */
export function resolveTenantDisplayName(supplierCode?: string) {
  return supplierCode
    ? TENANT_DISPLAY_NAMES[supplierCode as TenantSupplierCode]
    : undefined;
}
