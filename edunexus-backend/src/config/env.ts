import dotenv from "dotenv";
dotenv.config()
if (process.env.MONGODB_URI === undefined || process.env.PORT === undefined || process.env.APP_NAME === undefined || process.env.JWT_SECRET === undefined) {
  console.error("Error: MONGODB_URI or PORT or APP_NAME or JWT_SECRET is not defined");
  process.exit(1);
}

export const config = {
  mongodbUri: process.env.MONGODB_URI,
  port: process.env.PORT,
  appName: process.env.APP_NAME,
  jwtSecret: process.env.JWT_SECRET,
};
