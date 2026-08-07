import { get } from './http';

export type SupplierCode = 'A' | 'C' | 'D';
export type TenantCode = 'aplus' | 'boat' | 'yurex';

export interface GlobalAdminTenantSummary {
  supplierCode: SupplierCode;
  tenantCode: TenantCode;
  displayName: string;
  hostTag: string;
}

export interface GlobalAdminTenantDetail extends GlobalAdminTenantSummary {
  capabilities: {
    wiki: boolean;
    auth: boolean;
    aily: boolean;
    wecomBot: boolean;
  };
}

export function listTenants() {
  return get<GlobalAdminTenantSummary[]>('/global-admin/tenants');
}

export function getTenant(tenantCode: string) {
  return get<GlobalAdminTenantDetail>(
    `/global-admin/tenants/${encodeURIComponent(tenantCode)}`
  );
}
