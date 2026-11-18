import { User, UserRole } from "../users/user.model";
import { Request, Response } from "express";
import { Tenant, TenantStatus } from "../tenants/tenant.model";
import { generateToken } from "../../utils/jwtUtils";

export const registerUser = async (req: Request, res: Response) => {
    try {
        if (req.tenant) {
            return res.status(400).json({ message: "Registration is only allowed on the platform domain" });
        }

        const { schoolName, subdomain, adminName, adminEmail, password } = req.body;
        if (!schoolName || !subdomain || !adminName || !adminEmail || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (password.length < 8) {
            return res.status(400).json({ message: "Password must be at least 8 characters long" });
        }

        const existingUser = await Tenant.findOne({ subdomain: subdomain.toLowerCase() });
        if (existingUser) {
            return res.status(409).json({ message: "Subdomain is already in use" });
        }

        const existingEmail = await User.findOne({ email: adminEmail.toLowerCase() });
        if (existingEmail) {
            return res.status(409).json({ message: "Email is already in use" });
        }

        const dbName = `edunexus_tenant_${subdomain.toLowerCase().replace(/-/g, '_')}`;
        const tenant = await Tenant.create({ name: schoolName, subdomain: subdomain, dbName: dbName, adminEmail: adminEmail, status: TenantStatus.PENDING });
        const user = await User.create({ name: adminName, email: adminEmail, password, role: UserRole.SCHOOL_ADMIN, tenantId: tenant._id });
        res.status(201).json({
            "message": "School registered successfully",
            "tenant": {
                "id": tenant._id,
                "name": tenant.name,
                "subdomain": tenant.subdomain,
                "status": tenant.status
            },
            "user": {
                "id": user._id,
                "name": user.name,
                "email": user.email,
                "role": user.role
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const loginUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
        if (!user) {
            return res.status(404).json({ message: "Invalid credentials" });
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        if (req.tenant) {
            if (user.tenantId?.toString() !== req.tenant._id.toString()) {
                return res.status(403).json({ message: "You do not belong to this school workspace" });
            }
        }
        const token = generateToken(user._id.toString(), user.role, user.tenantId?.toString());
        res.status(200).json({
            "message": "Login successful",
            "accessToken": token,
            "user": {
                "id": user._id,
                "name": user.name,
                "email": user.email,
                "role": user.role,
                "tenantId": user.tenantId
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
}