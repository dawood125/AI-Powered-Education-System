import mongoose, { Schema, model, Document } from 'mongoose';
import bcrypt from "bcrypt"

export enum UserRole {
    SUPER_ADMIN = "SUPER_ADMIN",
    SCHOOL_ADMIN = "SCHOOL_ADMIN"
}
export type IUser = Document & {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    tenantId?: mongoose.Types.ObjectId | null;
    comparePassword(candidatePassword: string): Promise<boolean>;
};


export const UserSchema = new Schema<IUser>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: Object.values(UserRole), required: true, default: UserRole.SCHOOL_ADMIN },
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", default: null }
}, { timestamps: true });

UserSchema.pre("save", async function() {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10);
});

UserSchema.methods.comparePassword = async function(password:string):Promise<boolean>{
    return bcrypt.compare(password,this.password)
}

export const User = model<IUser>("User", UserSchema);