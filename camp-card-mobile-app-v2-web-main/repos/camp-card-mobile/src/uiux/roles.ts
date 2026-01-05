export type AppRole = "customer" | "leader" | "scout";

export type Tenant = {
 id: string;
 name: string;
};

export type User = {
 id: string;
 name: string;
 role: AppRole;
 tenantId: string;
 troopId?: string;
 scoutId?: string;
};
