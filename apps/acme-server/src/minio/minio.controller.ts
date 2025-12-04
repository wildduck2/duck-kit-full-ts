import { Controller, Get, Param, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import type { Response } from 'express'
import type { ResponseType } from '~/common/types'
import { MinioService } from './minio.service'
import { MinioMessageType } from './minio.types'

@Controller('upload')
export class MinioController {
  constructor(private readonly minioService: MinioService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: any,
  ): Promise<ResponseType<typeof this.minioService.uploadFile, MinioMessageType>> {
    const path = await this.minioService.uploadFile(file.originalname, file.buffer, file.mimetype)
    return { data: path, message: 'MINIO_FILE_UPLOAD_SUCCESS', state: 'success' }
  }

  @Get(':filename')
  async download(@Param('filename') filename: string, @Res() res: Response) {
    const fileStream = await this.minioService.getFile(filename)
    fileStream?.pipe(res)
  }
}
