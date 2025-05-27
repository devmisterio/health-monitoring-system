import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Responder } from '../entities/responder.entity';
import { BatchHealthUpdateJob } from './batch-health-queue.service';

@Injectable()
@Processor('batch-health-updates')
export class BatchHealthQueueProcessor extends WorkerHost {
  private readonly logger = new Logger(BatchHealthQueueProcessor.name);

  constructor(
    @InjectRepository(Responder)
    private readonly responderRepository: Repository<Responder>,
  ) {
    super();
  }

  async process(job: Job<BatchHealthUpdateJob>): Promise<boolean> {
    const { updates, batchId } = job.data;

    this.logger.debug(
      `Processing batch ${batchId} with ${updates.length} health updates`,
      { batchId, jobId: job.id },
    );

    try {
      // Extract unique responder IDs for validation
      const responderIds = updates.map((update) => update.responderId);

      // Fetch all responders in a single query
      const responders = await this.responderRepository.find({
        where: {
          id: In(responderIds),
          isActive: true,
        },
      });

      // Create maps for efficient lookups
      const responderMap = new Map(responders.map((r) => [r.id, r]));
      const successfulUpdates: string[] = [];
      const failedUpdates: Array<{ responderId: string; error: string }> = [];

      // Process updates and prepare bulk update
      const respondersToUpdate: Responder[] = [];

      for (const update of updates) {
        const responder = responderMap.get(update.responderId);

        if (!responder) {
          this.logger.warn(
            `Active responder not found: ${update.responderId}`,
            { batchId, jobId: job.id, requestId: update.requestId },
          );
          failedUpdates.push({
            responderId: update.responderId,
            error: 'Active responder not found',
          });
          continue;
        }

        if (!this.isValidTokenForResponder(update.token, responder)) {
          this.logger.warn(
            `Invalid token for responder: ${update.responderId}`,
            { batchId, jobId: job.id, requestId: update.requestId },
          );
          failedUpdates.push({
            responderId: update.responderId,
            error: 'Invalid token for this responder',
          });
          continue;
        }

        // Update the responder's lastSeen timestamp
        responder.lastSeen = update.timestamp;
        respondersToUpdate.push(responder);
        successfulUpdates.push(update.responderId);
      }

      // Perform bulk update in a single transaction
      if (respondersToUpdate.length > 0) {
        await this.responderRepository.save(respondersToUpdate);
      }

      // Log any failures
      if (failedUpdates.length > 0) {
        this.logger.warn(
          `Batch ${batchId} completed with ${failedUpdates.length} failures`,
          {
            batchId,
            jobId: job.id,
            failures: failedUpdates,
          },
        );
      }

      // If all updates failed, this could indicate a systemic issue
      if (successfulUpdates.length === 0 && updates.length > 0) {
        throw new Error(
          `All ${updates.length} updates in batch ${batchId} failed`,
        );
      }

      return true;
    } catch (error) {
      const errorInfo = this.extractErrorInfo(error);

      this.logger.error(`Failed to process batch ${batchId}: ${errorInfo.message}`, {
        batchId,
        jobId: job.id,
        error: errorInfo.stack,
        attempt: job.attemptsMade + 1,
        maxAttempts: job.opts?.attempts || 1,
        updatesCount: updates.length,
      });

      throw error;
    }
  }

  private isValidTokenForResponder(
    token: string,
    responder: Responder,
  ): boolean {
    return responder.token === token;
  }

  private extractErrorInfo(error: unknown): { message: string; stack?: string } {
    if (error instanceof Error) {
      return { message: error.message, stack: error.stack };
    }
    return { message: 'Unknown error' };
  }
}
