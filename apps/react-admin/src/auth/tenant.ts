export type TenantSupplierCode = 'A' | 'C' | 'D';

export interface TenantAuthConfig {
  supplierCode: TenantSupplierCode;
  displayName: string;
}

const tenantDefinitions: ReadonlyArray<
  TenantAuthConfig & { hostSuffixes: readonly string[] }
> = [
  {
    supplierCode: 'A',
    displayName: 'Aplus',
    hostSuffixes: [
      'aplnk.com',
      'dev-v2.elnkpro.com',
      'test-xw.elnkpro.com',
      'uat.elnkpro.com',
    ],
  },
  {
    supplierCode: 'C',
    displayName: '小往',
    hostSuffixes: ['clouboat.com', 'test-com.elnkpro.com'],
  },
  {
    supplierCode: 'D',
    displayName: 'Yurex',
    hostSuffixes: ['yurexcc.com'],
  },
];

const defaultTenant = tenantDefinitions.find(
  ({ supplierCode }) => supplierCode === 'D',
)!;

/** 根据 hostname 解析后端登录所需的租户服务商。 */
export function resolveTenantAuthConfig(hostname: string): TenantAuthConfig {
  const normalized = hostname.trim().toLowerCase().replace(/\.$/, '');
  const matched =
    tenantDefinitions.find(({ hostSuffixes }) =>
      hostSuffixes.some(
        (suffix) => normalized === suffix || normalized.endsWith(`.${suffix}`),
      ),
    ) ?? defaultTenant;
  return {
    supplierCode: matched.supplierCode,
    displayName: matched.displayName,
  };
}

export function resolveTenantDisplayName(supplierCode?: string) {
  return tenantDefinitions.find((item) => item.supplierCode === supplierCode)
    ?.displayName;
}
