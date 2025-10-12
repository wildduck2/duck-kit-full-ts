import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { Request } from 'express'
import { Observable } from 'rxjs'
import { throwError } from '~/common/libs'
import { AuthErrorType } from './auth.types'

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    if (context.switchToHttp().getRequest<Request>().session.userId) return true

    throwError<AuthErrorType>('INVALID_CREDENTIALS')
    return false
  }
}
