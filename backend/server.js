import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envResult = dotenv.config({ path: path.resolve(__dirname, ".env") });
const envCount = Object.keys(envResult.parsed || {}).length;
process.env.TZ = "Asia/Kolkata";

import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import { connectDB } from "./config/db.js";
import apiRoutes from "./routes/index.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

const app = express();

// ---------- Core middleware ----------
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Only log HTTP errors (4xx / 5xx) so logs stay clean
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev", { skip: (req, res) => res.statusCode < 400 }));
}

// ---------- Health check ----------
app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "HASHTELICOM API is running" });
});

// ---------- API routes ----------
app.use("/api", apiRoutes);

// ---------- 404 + error handler ----------
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🔗 ${envCount} .env variables connected`);
  });
});

export default app;
