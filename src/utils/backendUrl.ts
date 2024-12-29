import { config } from "dotenv";
config();
const getBackendUrl = (): string => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backendUrl) {
    throw new Error("Backend URL is not defined in the environment variables");
  }
  return backendUrl;
};

export { getBackendUrl };
