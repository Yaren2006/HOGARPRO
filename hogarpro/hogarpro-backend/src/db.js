import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
dotenv.config({ path: fileURLToPath(new URL('../.env', import.meta.url)), quiet: true });
export function dbOptions(database = process.env.DB_NAME || 'hogarpro') {
 return { host: process.env.DB_HOST || '127.0.0.1', port: Number(process.env.DB_PORT || 3306), user: process.env.DB_USER || 'root', password: process.env.DB_PASSWORD || '', database, charset: 'utf8mb4', timezone: 'Z', dateStrings: true };
}
export function makePool(database) { return mysql.createPool({ ...dbOptions(database), connectionLimit: 8, waitForConnections: true }); }
