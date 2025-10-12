import { Controller, Get } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import {
  DiskHealthIndicator,
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  MemoryHealthIndicator,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus'
import { HealthService } from './health.service'

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private db: TypeOrmHealthIndicator,
    private disk: DiskHealthIndicator,
    private memory: MemoryHealthIndicator,
    private healthService: HealthService,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Check application health' })
  @ApiResponse({ description: 'Application is healthy', status: 200 })
  @ApiResponse({ description: 'Application is unhealthy', status: 503 })
  async check() {
    return this.health.check([
      () => this.db.pingCheck('database'),
      () => this.healthService.checkRedis(),
      () => this.healthService.checkMinio(),
      // The process should not use more than 300MB memory
      () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024),
      // The process should not have more than 1.5GB allocated
      () => this.memory.checkRSS('memory_rss', 1.5 * 1024 * 1024 * 1024),
    ])
  }

  @Get('live')
  @HealthCheck()
  @ApiOperation({ summary: 'Liveness check' })
  @ApiResponse({ description: 'Application is live', status: 200 })
  liveness() {
    return { status: 'ok', timestamp: new Date().toISOString() }
  }

  @Get('ready')
  @HealthCheck()
  @ApiOperation({ summary: 'Readiness check' })
  @ApiResponse({ description: 'Application is ready', status: 200 })
  @ApiResponse({ description: 'Application is not ready', status: 503 })
  async readiness() {
    return this.health.check([
      () => this.db.pingCheck('database'),
      () => this.healthService.checkRedis(),
      () => this.healthService.checkMinio(),
    ])
  }
}
