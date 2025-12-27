export class AppError extends Error {
  status: number

  constructor(message: string, status = 500) {
    super(message)
    this.name = 'AppError'
    this.status = status
  }
}

export function throwError<T extends string>(message: T, status = 500): never {
  throw new AppError(message, status)
}
