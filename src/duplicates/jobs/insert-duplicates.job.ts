import { Process, Processor } from '@nestjs/bull';
import { DuplicatesInsertQueue } from '../queues/duplicates-insert.queue';
import { InsertDuplicatesJobDto } from '../dto/insert-duplicates-job.dto';
import { Duplicate } from 'src/@database/entities/duplicate.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

type JobPayload = {
  data: InsertDuplicatesJobDto;
};

@Processor(DuplicatesInsertQueue.queueName)
export class InsertDuplicatesProcessor {
  constructor(
    @InjectRepository(Duplicate)
    private duplicateRepository: Repository<Duplicate>,
  ) {}
  @Process()
  async process(job: JobPayload) {
    const { table, values } = job.data;
    await this.duplicateRepository
      .createQueryBuilder()
      .insert()
      .into(table)
      .values(values)
      .execute();
  }
}
