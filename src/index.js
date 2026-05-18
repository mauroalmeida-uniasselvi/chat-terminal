import dotenv from "dotenv";
import { handler } from "./handler/index.js";

// Load environment variables from .env file
dotenv.config();

// teste

handler(process.argv.slice(2));