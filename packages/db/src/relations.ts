import { relations } from 'drizzle-orm'
import { otpCodes, users } from './tables'

/**
 * USERS RELATIONS
 */
export const usersRelations = relations(users, ({ many }) => ({
  otpCodes: many(otpCodes),
}))

/**
 * OTP CODES RELATIONS
 */
export const otpCodesRelations = relations(otpCodes, ({ one }) => ({
  user: one(users, {
    fields: [otpCodes.user_id],
    references: [users.id],
  }),
}))
