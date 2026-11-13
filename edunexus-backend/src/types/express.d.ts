import { ITenant } from '../modules/tenants/tenant.model';

declare global {
  namespace Express {
    interface Request {
      tenant?: ITenant | null;
    }
  }
}