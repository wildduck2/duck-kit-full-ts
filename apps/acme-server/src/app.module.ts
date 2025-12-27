import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ScheduleModule } from '@nestjs/schedule'
import { CronService } from './app.service'
import { AuthModule } from './auth'
import { DrizzleModule } from './drizzle'
import { EmailModule } from './email'
import { LoggerModule } from './logger'
import { MinioModule } from './minio'
import { RedisModule } from './redis'

@Module({
  controllers: [],
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    LoggerModule,
    DrizzleModule,
    RedisModule,
    MinioModule,
    EmailModule,
    AuthModule,
  ],
  providers: [CronService],
})
export class AppModule {}
