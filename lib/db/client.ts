import postgres from 'postgres'

let client: ReturnType<typeof postgres> | null = null

export function getClient() {
  if (!client) {
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set')
    }
    client = postgres(connectionString)
  }
  return client
}

export async function closeConnection() {
  if (client) {
    await client.end()
    client = null
  }
}

// For executing raw queries
export const db = async () => {
  return getClient()
}
