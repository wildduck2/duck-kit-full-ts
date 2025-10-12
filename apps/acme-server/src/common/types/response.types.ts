export type ResponseType<TData extends unknown, TError extends readonly string[] = []> =
  | {
      state: 'error'
      error: TError[number]
      message: string
    }
  | {
      data: TData
      state: 'success'
    }
