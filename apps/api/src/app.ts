import express from "express";
import cors from "cors";
import uploadRoutes from "./routes/upload.route";
import authRoutes from "./routes/auth.route";
import videoRoutes from "./routes/video.route";
import { authenticate } from "./middleware/auth.middleware";

const app = express();

app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());

app.get("/", (_, res) => {
  res.json({ message: "Server is up!" });
});

// Auth routes (public)
app.use("/auth", authRoutes);

// Protected routes
app.use("/upload", authenticate, uploadRoutes);
app.use("/videos", authenticate, videoRoutes);

export default app;

