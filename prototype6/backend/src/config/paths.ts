import path from "path";
import fs from "fs";

export const uploadDir = path.join(__dirname, "../../uploads");
export const outputDir = path.join(__dirname, "../../outputs");

fs.mkdirSync(uploadDir, { recursive: true });
fs.mkdirSync(outputDir, { recursive: true });