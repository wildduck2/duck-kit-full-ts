import { ArgumentsHost, Catch, ExceptionFilter, Inject, Injectable, WsExceptionFilter } from '@nestjs/common'
import { Response } from 'express'
import { WINSTON_MODULE_NEST_PROVIDER, WinstonLogger } from 'nest-winston'
import { Socket } from 'socket.io'

@Injectable()
@Catch()
export class ErrorExceptionFilter implements ExceptionFilter {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: WinstonLogger,
  ) {}

  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()
    const status = 500

    const logPayload = {
      type: 'HTTP_EXCEPTION',
      message: exception.message,
      stack: exception.stack,
      url: request.url,
      method: request.method,
      ip:
        request.headers['x-forwarded-for'] ||
        (request as any).connection?.remoteAddress ||
        (request as any).socket.remoteAddress,
      headers: request.headers,
    }

    this.logger.error(logPayload)

    response.status(status).json({
      state: 'error',
      message: exception.message,
    })
  }
}

@Injectable()
@Catch()
export class WSErrorExceptionFilter implements WsExceptionFilter {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: WinstonLogger,
  ) {}

  catch(exception: Error, host: ArgumentsHost) {
    const client: Socket = host.switchToWs().getClient<Socket>()
    const data = host.switchToWs().getData()
    const ip = client.handshake?.address

    const logPayload = {
      type: 'WS_EXCEPTION',
      message: exception.message,
      stack: exception.stack,
      event: data?.event || 'unknown',
      data: data,
      ip,
      headers: client.handshake?.headers,
    }

    this.logger.error(logPayload)

    client.emit('error', {
      status: 'error',
      message: exception.message,
    })
  }
}
