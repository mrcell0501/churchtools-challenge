import { Module } from '@nestjs/common';
import { DuplicatesService } from './duplicates.service';
import { DuplicatesController } from './duplicates.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Person } from 'src/@database/entities/person.entity';
import { PersonDetails } from 'src/@database/entities/person-details.entity';
import { StoreDuplicitiesRoutine } from './routines/store-duplicities.routine';
import { Duplicate } from 'src/@database/entities/duplicate.entity';
import { BullModule } from '@nestjs/bull';
import { DuplicatesInsertQueue } from './queues/duplicates-insert.queue';
import { InsertDuplicatesProcessor } from './jobs/insert-duplicates.job';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullAdapter } from '@bull-board/api/bullAdapter';

@Module({
  controllers: [DuplicatesController],
  providers: [
    DuplicatesService,
    StoreDuplicitiesRoutine,
    DuplicatesInsertQueue,
    InsertDuplicatesProcessor,
  ],
  imports: [
    TypeOrmModule.forFeature([Person, PersonDetails, Duplicate]),
    BullModule.registerQueue({ name: DuplicatesInsertQueue.queueName }),
    BullBoardModule.forFeature({
      name: DuplicatesInsertQueue.queueName,
      adapter: BullAdapter,
    }),
  ],
  exports: [DuplicatesService],
})
export class DuplicatesModule {}
