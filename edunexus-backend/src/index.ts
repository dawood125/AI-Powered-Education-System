import connectDB from "./db/connect"
import app from "./app"
import { config } from "./config/env";

connectDB();

app.listen(config.port, () => console.log(`Server is running on port ${config.port}`));