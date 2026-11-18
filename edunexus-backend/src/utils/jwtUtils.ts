import jwt from "jsonwebtoken";
import { UserRole } from "../modules/users/user.model";

export const generateToken = (userId: string, role: UserRole, tenantId?: string | null) => {
    return jwt.sign(
        { userId, role, tenantId },
        process.env.JWT_SECRET as string,
        { expiresIn: "1h" }
    );
};

export const verifyToken = (token: string) => {
    return jwt.verify(token, process.env.JWT_SECRET as string);
}