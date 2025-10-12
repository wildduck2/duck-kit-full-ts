import { Inject, Injectable, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { HealthCheckError, HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus'
import { InjectRedis } from '@nestjs-modules/ioredis'
import { Redis } from 'ioredis'
import { Client } from 'minio'

@Injectable()
export class HealthService extends HealthIndicator implements OnModuleInit {
  private readonly minioBucket: string

  constructor(
    @InjectRedis() private readonly redis: Redis,
    @Inject('MINIO') private readonly minioClient: Client,
    private readonly configService: ConfigService,
  ) {
    super()
    this.minioBucket = this.configService.get('MINIO_BUCKET') || 'default-bucket'
  }

  async onModuleInit() {
    // Ensure the MinIO bucket exists
    try {
      const bucketExists = await this.minioClient.bucketExists(this.minioBucket)
      if (!bucketExists) {
        await this.minioClient.makeBucket(this.minioBucket, 'us-east-1')
      }
    } catch (error) {
      console.error('Failed to initialize MinIO bucket:', error)
    }
  }

  async checkRedis(): Promise<HealthIndicatorResult> {
    try {
      await this.redis.ping()
      return this.getStatus('redis', true)
    } catch (error) {
      throw new HealthCheckError('Redis check failed', this.getStatus('redis', false, { message: error.message }))
    }
  }

  async checkMinio(): Promise<HealthIndicatorResult> {
    try {
      // Check if we can list buckets (requires s3:ListAllMyBuckets permission)
      await this.minioClient.listBuckets()

      // Check if we can access the bucket
      await this.minioClient.bucketExists(this.minioBucket)

      return this.getStatus('minio', true)
    } catch (error) {
      throw new HealthCheckError('MinIO check failed', this.getStatus('minio', false, { message: error.message }))
    }
  }

  // Additional health indicators can be added here
  async checkExternalService(url: string, key: string): Promise<HealthIndicatorResult> {
    try {
      const response = await fetch(url)
      const isHealthy = response.status === 200
      return this.getStatus(key, isHealthy, { status: response.status })
    } catch (error) {
      throw new HealthCheckError(`${key} check failed`, this.getStatus(key, false, { message: error.message }))
    }
  }
}
