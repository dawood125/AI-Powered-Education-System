import express from "express";
import correlationIdMiddleware from "./middleware/correlationId";
import errorHandler from "./middleware/errorHandler";
import router from "./routes/health"
import authRouter from "./modules/auth/auth.routes"
import { tenantResolver } from "./middleware/tenantResolver";
const app=express();

app.use(express.json());

app.use(express.urlencoded({extended:true}));

app.use(correlationIdMiddleware);
app.use(tenantResolver)
app.use(router)

app.use("/api/auth", authRouter)

app.use(errorHandler);

export default app;