import { Schema, model, Document } from 'mongoose';

export enum TenantStatus {
    PENDING = "PENDING",
    ACTIVE = "ACTIVE",
    SUSPENDED = "SUSPENDED",
    ARCHIVED = "ARCHIVED"
}
export type ITenant = Document & {
    name: string;
    subdomain: string;
    dbName: string;
    adminEmail: string;
    status: TenantStatus;
};
const TenantSchema = new Schema({
    name: { type: String, required: true ,trim:true},
    subdomain: { type: String, required: true, unique:true ,lowercase:true , trim:true,match: [/^[a-z0-9-]+$/, "Subdomain can only contain lowercase letters, numbers, and hyphens"] },
    dbName: { type: String, required: true,unique:true ,lowercase:true , trim:true },
    adminEmail: { type: String , required: true ,lowercase:true , trim:true},
    status: { type: String, enum: Object.values(TenantStatus) , default: TenantStatus.PENDING },
},
{ timestamps: true });

export const Tenant = model<ITenant>("Tenant", TenantSchema);
