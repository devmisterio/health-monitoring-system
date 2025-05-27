import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { RespondersController } from './responders.controller';
import { RespondersService } from './responders.service';
import { Responder } from './entities/responder.entity';
import { BatchHealthQueueService, BatchHealthQueueProcessor } from './queue';

@Module({
  imports: [
    TypeOrmModule.forFeature([Responder]),
    BullModule.registerQueue({
      name: 'batch-health-updates',
    }),
  ],
  controllers: [RespondersController],
  providers: [
    RespondersService,
    BatchHealthQueueService,
    BatchHealthQueueProcessor,
  ],
  exports: [RespondersService, BatchHealthQueueService],
})
export class RespondersModule {}
