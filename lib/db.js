import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL is not set. Add it in your Vercel project settings.");
}

// `sql` is a tagged template function: sql`select * from users where id = ${id}`
export const sql = neon(process.env.DATABASE_URL);
