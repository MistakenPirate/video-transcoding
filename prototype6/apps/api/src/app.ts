import express from "express";
import uploadRoutes from "./routes/upload.route";

const app = express();

app.use(express.json());

app.get("/", (_, res) => {
  res.json({ message: "Server is up!" });
});
app.use("/upload", uploadRoutes);

export default app;

