export type ResponseType<TData extends (...args: any[]) => any, TMessage extends string = any> =
  | {
      state: 'error'
      message: TMessage
    }
  | {
      data: Awaited<ReturnType<TData>>
      state: 'success'
      message: TMessage
    }
