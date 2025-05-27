import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { HealthUpdateDto } from '../dto/responder.dto';
import Redis from 'ioredis';

export interface BatchHealthUpdateJob {
  updates: Array<{
    responderId: string;
    timestamp: Date;
    token: string;
    requestId?: string;
  }>;
  batchId: string;
  createdAt: Date;
}

export interface HealthUpdateBuffer {
  responderId: string;
  timestamp: Date;
  token: string;
  requestId?: string;
}

@Injectable()
export class BatchHealthQueueService implements OnModuleDestroy {
  private readonly logger = new Logger(BatchHealthQueueService.name);
  private readonly batchThreshold: number;
  private readonly timeThreshold: number;
  private batchTimer: NodeJS.Timeout | null = null;
  private readonly redisClient: Redis;
  private readonly healthUpdatesKey = 'health_updates_queue';

  constructor(
    @InjectQueue('batch-health-updates')
    private batchHealthUpdatesQueue: Queue<BatchHealthUpdateJob>,
    private configService: ConfigService,
  ) {
    this.redisClient = new Redis({
      host: this.configService.get<string>('redis.host'),
      port: this.configService.get<number>('redis.port'),
    });

    this.batchThreshold = this.configService.get<number>('batch.threshold', 50);
    this.timeThreshold = this.configService.get<number>(
      'batch.timeThreshold',
      5000,
    );

    this.logger.log(
      `Batch processing initialized with threshold: ${this.batchThreshold}, time: ${this.timeThreshold}ms`,
    );

    // Start the periodic batch processing timer
    this.startBatchTimer();
  }

  async addHealthUpdate(
    dto: HealthUpdateDto,
    requestId?: string,
  ): Promise<string> {
    const updateData: HealthUpdateBuffer = {
      responderId: dto.responderId,
      timestamp: dto.timestamp ? new Date(dto.timestamp) : new Date(),
      token: dto.token,
      requestId,
    };

    // Add to Redis using HSET to ensure only the latest update per responder
    await this.redisClient.hset(
      this.healthUpdatesKey,
      dto.responderId,
      JSON.stringify(updateData),
    );

    // Set TTL only if the key doesn't already have one
    const currentTTL = await this.redisClient.ttl(this.healthUpdatesKey);
    if (currentTTL === -1) {
      await this.redisClient.expire(this.healthUpdatesKey, 10);
    }

    const bufferSize = await this.redisClient.hlen(this.healthUpdatesKey);

    // Check if we should trigger immediate batch processing
    if (bufferSize >= this.batchThreshold) {
      await this.processBatch();
    }

    return `batched-${dto.responderId}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  }

  private async processBatch(): Promise<void> {
    // Get all health updates from Redis and clear them atomically
    const pipeline = this.redisClient.pipeline();
    pipeline.hgetall(this.healthUpdatesKey);
    pipeline.del(this.healthUpdatesKey);
    const results = await pipeline.exec();

    if (!results || !results[0] || !results[0][1]) {
      this.logger.debug('No health updates to process in batch');
      return;
    }

    const redisData = results[0][1] as Record<string, string>;
    const updates: HealthUpdateBuffer[] = Object.values(redisData).map(
      (data) => JSON.parse(data) as HealthUpdateBuffer,
    );

    if (updates.length === 0) {
      return;
    }

    const batchId = `batch-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    const jobData: BatchHealthUpdateJob = {
      updates,
      batchId,
      createdAt: new Date(),
    };

    await this.batchHealthUpdatesQueue.add(
      'process-batch-health-update',
      jobData,
      {
        removeOnComplete: 50,
        removeOnFail: 25,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    );
  }

  private startBatchTimer(): void {
    this.batchTimer = setInterval(() => {
      this.processBatch().catch((error) => {
        this.logger.error('Error processing scheduled batch', error);
      });
    }, this.timeThreshold);
  }

  async onModuleDestroy(): Promise<void> {
    await this.shutdown();
  }

  async shutdown(): Promise<void> {
    if (this.batchTimer) {
      clearInterval(this.batchTimer);
      this.batchTimer = null;
    }

    // Process any remaining updates before shutdown
    const bufferSize = await this.redisClient.hlen(this.healthUpdatesKey);
    if (bufferSize > 0) {
      await this.processBatch();
    }

    // Close Redis connection
    await this.redisClient.quit();
  }
}
