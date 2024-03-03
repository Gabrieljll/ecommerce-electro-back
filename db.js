import { createPool } from "mysql2/promise"

export const pool = createPool({
  host: '',
  port: 3306,
  user: '',
  password: '',
  database: ''

})