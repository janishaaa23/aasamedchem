require('dotenv').config({ path: '.env.local' })
const postgres = require('postgres')

async function check() {
  const sql = postgres(process.env.DATABASE_URL)

  const users = await sql`
    SELECT id, email, name, role, is_active
    FROM users
  `

  console.log(users)

  await sql.end()
}

check()