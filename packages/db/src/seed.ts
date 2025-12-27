import * as crypto from 'crypto'
import { eq } from 'drizzle-orm'
import { db } from './db'
import { otpCodes, users } from './tables'

/**
 * Helper function to hash passwords.
 * NOTE: In production, use bcrypt/argon2 instead of sha256.
 */
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex')
}

/**
 * Helper function to generate a random 6-digit OTP code.
 */
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Helper function to generate a random date within a given range.
 */
function getRandomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

/**
 * Main seed function to populate the database with realistic test data.
 * Matches ONLY: users, otp_codes
 */
async function seed() {
  try {
    console.log('Starting database seeding...')

    // Clear existing data (child table first because of FK)
    console.log('Clearing existing data...')
    await db.delete(otpCodes)
    await db.delete(users)

    // Seed Users
    console.log('Seeding users...')
    const now = new Date()

    const insertedUsers = await db
      .insert(users)
      .values([
        {
          avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
          created_at: new Date(Date.now() - 85 * 24 * 60 * 60 * 1000),
          email: 'john.doe@example.com',
          first_name: 'John',
          is_active: true,
          last_login_at: new Date(),
          last_name: 'Doe',
          password_hash: hashPassword('password123'),
          settings: { notifications: true, theme: 'dark' },
          username: 'johndoe',
        },
        {
          avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jane',
          created_at: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000),
          email: 'jane.smith@example.com',
          first_name: 'Jane',
          is_active: true,
          last_login_at: new Date(Date.now() - 24 * 60 * 60 * 1000),
          last_name: 'Smith',
          password_hash: hashPassword('password123'),
          settings: { notifications: false, theme: 'light' },
          username: 'janesmith',
        },
        {
          avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
          created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
          email: 'bob.johnson@example.com',
          first_name: 'Bob',
          is_active: false,
          last_login_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          last_name: 'Johnson',
          password_hash: hashPassword('password123'),
          settings: { notifications: true, theme: 'dark' },
          username: 'bobjohnson',
        },
        {
          avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
          created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
          email: 'alice.williams@example.com',
          first_name: 'Alice',
          is_active: true,
          last_login_at: null,
          last_name: 'Williams',
          password_hash: hashPassword('password123'),
          settings: { notifications: true, theme: 'auto' },
          username: 'alicewilliams',
        },
        {
          avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=charlie',
          created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          email: 'charlie.brown@example.com',
          first_name: 'Charlie',
          is_active: true,
          last_login_at: null,
          last_name: 'Brown',
          password_hash: hashPassword('password123'),
          settings: { notifications: true, theme: 'dark' },
          username: 'charliebrown',
        },
      ])
      .returning()

    console.log(`Created ${insertedUsers.length} users.`)

    // Seed OTP Codes
    console.log('Seeding OTP codes...')

    // Two active OTPs (for first 2 users), one expired/inactive for user 1
    const otpCodesData = insertedUsers.slice(0, 2).map((user) => ({
      code: generateOTP(),
      expires_at: new Date(Date.now() + 10 * 60 * 1000),
      is_active: true,
      user_id: user.id,
    }))

    otpCodesData.push({
      code: generateOTP(),
      expires_at: new Date(Date.now() - 10 * 60 * 1000),
      is_active: false,
      user_id: insertedUsers[0].id,
    })

    const insertedOtpCodes = await db.insert(otpCodes).values(otpCodesData).returning()
    console.log(`Created ${insertedOtpCodes.length} OTP codes.`)

    // Update last_login_at for active users to random times in last 30 days
    console.log('Updating user login history...')
    for (const user of insertedUsers.filter((u) => u.is_active)) {
      const loginDate = getRandomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), now)
      await db.update(users).set({ last_login_at: loginDate }).where(eq(users.id, user.id))
    }

    console.log('Database seeding completed successfully!')
    console.log('Summary:')
    console.log(`- Users: ${insertedUsers.length}`)
    console.log(`- OTP Codes: ${insertedOtpCodes.length}`)

    console.log('Test Credentials:')
    console.log('- Email: john.doe@example.com')
    console.log('- Password: password123')
  } catch (error) {
    console.error('Error seeding database:', error)
    throw error
  }
}

// Run the seed function
seed()
  .then(() => {
    console.log('Seed script finished successfully.')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Seed script failed:', error)
    process.exit(1)
  })
