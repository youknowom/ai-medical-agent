import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
//hi
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle({ client: sql });
