import { WsException } from '@nestjs/websockets'

export class AppError extends Error {
  public readonly status: number
  public readonly code: string
  public readonly details?: Record<string, any>

  constructor(code: string, status: number, message?: string, details?: Record<string, any>) {
    super(message ?? code)
    this.name = 'AppError'
    this.status = status
    this.code = code
    this.details = details

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        details: this.details ?? null,
        message: this.message,
        status: this.status,
      },
    }
  }
}

// a helper so you don't repeat "throw new AppError"
export function throwError<T extends string>(code: T, status: number, details?: Record<string, any>): never {
  throw new AppError(code, status, undefined, details)
}

export function throwWSError<T extends string>(string: T): Error {
  throw new WsException(string)
}
