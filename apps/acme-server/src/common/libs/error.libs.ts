export function throwError<T extends string>(string: T, cause?: number): Error {
  throw new Error(string, {
    cause,
  })
}
