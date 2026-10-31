import { Router } from "express";   
import mongoose from "mongoose";
const router = Router();
router.get("/health", async (req, res) => {
    res.send({
        "status": "ok",
        "db": mongoose.connection.readyState === 1 ? "connected" : "disconnected",
        "correlationId": res.locals.correlationId 
    });
})

export default router;