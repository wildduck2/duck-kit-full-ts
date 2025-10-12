import { ArgumentMetadata, PipeTransform } from '@nestjs/common'
import { z, ZodSchema } from 'zod'
import { throwError } from '../libs'

// NOTE: how pipes handles errors.
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown, metadata: ArgumentMetadata): z.infer<typeof this.schema> {
    try {
      return this.schema.parse(value)
    } catch (error) {
      console.log('ZOD_VALIDATION_PIPE', error)
      throwError('ZOD_VALIDATION_PIPE')
    }
  }
}
