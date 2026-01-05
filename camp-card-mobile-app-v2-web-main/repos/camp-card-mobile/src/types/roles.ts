export type AppRole = 'customer' | 'leader' | 'scout';

// Mirrors backend role strings (see docs/build-specification/PART-05-API-SPECIFICATIONS.md)
export type ApiRole =
 | 'CUSTOMER'
 | 'SCOUT'
 | 'TROOP_LEADER'
 | 'COUNCIL_ADMIN'
 | 'SYSTEM_ADMIN'
 | 'MERCHANT';

export type Tenant = {
 id: string;
 name?: string;
};

export type User = {
 id: string;
 email: string;
 name?: string;
 role: AppRole;
 tenantId?: string; // council_id in API
 troopId?: string;
 scoutId?: string;
};

export function mapApiRoleToAppRole(apiRole: ApiRole): AppRole {
 switch (apiRole) {
 case 'CUSTOMER':
 return 'customer';
 case 'SCOUT':
 return 'scout';
 case 'TROOP_LEADER':
 case 'COUNCIL_ADMIN':
 case 'SYSTEM_ADMIN':
 return 'leader';
 default:
 return 'customer';
 }
}
