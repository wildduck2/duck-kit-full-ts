import { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import { otpCodes, users } from './tables'

// ========== USERS ==========
export type User = InferSelectModel<typeof users>
export type NewUser = InferInsertModel<typeof users>

// ========== OTP CODES ==========
export type OtpCode = InferSelectModel<typeof otpCodes>
export type NewOtpCode = InferInsertModel<typeof otpCodes>
