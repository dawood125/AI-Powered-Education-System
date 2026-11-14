import { NextFunction, Request, Response } from "express";
import { TenantStatus } from "../modules/tenants/tenant.model";
import { Tenant } from "../modules/tenants/tenant.model";

export const tenantResolver = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let hostname = req.hostname;
        let subdomain = hostname.split('.')[0];
        if (hostname === "localhost" || hostname === "127.0.0.1") {
            req.tenant = null;
            return next();
        }
        let tenant = await Tenant.findOne({
            subdomain: subdomain.toLowerCase()
        });
        if (!tenant) {
            return res.status(404).json({ error: "School workspace not found", correlationId: res.locals.correlationId })
        }
        if (tenant?.status === TenantStatus.SUSPENDED) {
            return res.status(403).json({ error: "School workspace is suspended", correlationId: res.locals.correlationId })
        }
        req.tenant = tenant;
        next()
    } catch (error) {
        return res.status(500).json({ error: "Internal server error", correlationId: res.locals.correlationId })
    }
}