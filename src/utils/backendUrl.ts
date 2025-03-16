import { config } from "dotenv";
config();
export const backendUrl =
  process.env.NEXT_PUBLIC_NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_PRODUCTION_URL
    : process.env.NEXT_PUBLIC_BACKEND_URL;
console.log(backendUrl);
