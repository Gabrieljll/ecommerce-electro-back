import { createPool } from "mysql2/promise"
import dotenv from 'dotenv';


dotenv.config();

const HOST = process.env.DB_HOST || 'localhost'
const PORT = process.env.DB_PORT
const USER = process.env.DB_USER
const PASSWORD = process.env.DB_PASSWORD
const DATABASE = process.env.DB_DATABASE

export const pool = createPool({
  host: HOST,
  port: PORT,
  user: USER,
  password: PASSWORD,
  database: DATABASE

})