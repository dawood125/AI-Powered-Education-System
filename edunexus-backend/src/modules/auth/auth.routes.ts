import { Router } from "express";   
import mongoose from "mongoose";
import { registerUser } from "./auth.controller";
const authRouter = Router();

authRouter.post("/register", registerUser);

export default authRouter;