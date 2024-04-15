import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { InsertDuplicatesJobDto } from '../dto/insert-duplicates-job.dto';

@Injectable()
export class DuplicatesInsertQueue {
  public static queueName = 'duplicates-insert';
  constructor(
    @InjectQueue(DuplicatesInsertQueue.queueName) private queue: Queue,
  ) {}

  publish(data: InsertDuplicatesJobDto) {
    return this.queue.add(data);
  }

  async onDrained(callback) {
    this.queue.on('drained', callback);
  }
}
