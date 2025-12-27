import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Request } from 'express'
import { Observable } from 'rxjs'
import { throwError } from '~/common/libs'
import { AuthMessageType } from './auth.types'

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    if (context.switchToHttp().getRequest<Request>().session.user?.id) return true

    throwError<AuthMessageType>('AUTH_INVALID_CREDENTIALS')
    return false
  }
}
