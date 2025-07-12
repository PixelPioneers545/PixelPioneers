
import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config(); // Load .env file

const client = new Client({
  host: process.env.PG_HOST,
  port: Number(process.env.PG_PORT),
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
});

await client.connect(); // Top-level await is fine in ESM

console.log('✅ PostgreSQL connected');

export default client;
