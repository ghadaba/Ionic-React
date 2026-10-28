import path from "node:path";
import { fileURLToPath } from "node:url";

const backendDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const envFiles = [path.join(backendDirectory, ".env"), path.join(backendDirectory, "..", ".env")];

for (const envFile of envFiles) {
  try {
    process.loadEnvFile(envFile);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}