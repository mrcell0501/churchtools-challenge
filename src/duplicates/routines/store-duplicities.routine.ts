import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import knex from 'knex';
import {
  Duplicate,
  DuplicateCriteria,
} from 'src/@database/entities/duplicate.entity';
import { DuplicatesInsertQueue } from '../queues/duplicates-insert.queue';

type Database = ReturnType<typeof knex>;

const parseDatabaseType = (type: string) => {
  const mapping = {
    mysql: 'mysql2',
  };
  return mapping[type] ?? type;
};

@Injectable()
export class StoreDuplicitiesRoutine {
  private readonly logger = new Logger(StoreDuplicitiesRoutine.name);

  constructor(
    private duplicatesInsertQueue: DuplicatesInsertQueue,
    private configService: ConfigService,
  ) {}

  // this cron expression value is only for development purpose
  @Cron('* * * * *')
  async handleCron() {
    try {
      const dbConfig = this.configService.getOrThrow('database');
      const database = knex({
        client: parseDatabaseType(dbConfig.type),
        connection: {
          host: dbConfig.host,
          port: dbConfig.port,
          user: dbConfig.username,
          password: dbConfig.password,
          database: dbConfig.database,
        },
      });

      this.logger.debug('processing started');

      await this.createTemporaryTable(database);
      await this.findPeopleWithDuplicatedEmail(database);
      await this.findPeopleWithDuplicatedPrivatePhone(database);
      await this.findPeopleWithDuplicatedNameAndAddress(database);

      await this.waitFindingsGetProcessed();

      await this.swapTables(database);
      await this.closeDatabaseConnection(database);

      this.logger.debug('processing finished');
    } catch (error) {
      this.logger.error(error);
    }
  }

  private async closeDatabaseConnection(database: Database): Promise<void> {
    await database.destroy();
  }

  private async waitFindingsGetProcessed(): Promise<void> {
    return new Promise((resolve) => {
      this.duplicatesInsertQueue.onDrained(() => {
        this.logger.debug('queue is empty!');
        resolve();
      });
    });
  }

  private async createTemporaryTable(database: Database): Promise<void> {
    await database.schema.dropTableIfExists(Duplicate.temporaryTableName);
    await database.raw(
      `CREATE TABLE ${Duplicate.temporaryTableName} LIKE ${Duplicate.tableName};`,
    );
  }

  private async swapTables(database: Database): Promise<void> {
    await database.schema.dropTableIfExists(`${Duplicate.tableName}_old`);
    await database.raw(
      `RENAME TABLE ${Duplicate.tableName} TO ${Duplicate.tableName}_old, ${Duplicate.temporaryTableName} TO ${Duplicate.tableName};`,
    );
  }

  private async findPeopleWithDuplicatedEmail(
    database: Database,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      database
        .table('cdb_person AS p1')
        .innerJoin('cdb_person AS p2', (builder) => {
          builder.on('p1.email', '=', 'p2.email').on('p1.id', '<>', 'p2.id');
        })
        .whereRaw(`coalesce(p1.email) <> ''`)
        .select({
          person_id: 'p1.id',
          duplicate_person_id: 'p2.id',
        })
        .stream((stream) => {
          stream.on('data', async ({ person_id, duplicate_person_id }) => {
            await this.duplicatesInsertQueue.publish({
              table: Duplicate.temporaryTableName,
              values: [
                {
                  criteria: DuplicateCriteria.EMAIL,
                  person_id,
                  duplicate_person_id,
                },
              ],
            });
          });
          stream.on('end', () => {
            resolve();
          });
          stream.on('error', (error) => {
            reject(error);
          });
        });
    });
  }

  private async findPeopleWithDuplicatedPrivatePhone(
    database: Database,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      database
        .table('cdb_person AS p1')
        .innerJoin('cdb_person AS p2', (builder) => {
          builder
            .on('p1.telefonprivat', '=', 'p2.telefonprivat')
            .on('p1.id', '<>', 'p2.id');
        })
        .whereRaw(`coalesce(p1.telefonprivat) <> ''`)
        .select({
          person_id: 'p1.id',
          duplicate_person_id: 'p2.id',
        })
        .stream((stream) => {
          stream.on('data', async ({ person_id, duplicate_person_id }) => {
            await this.duplicatesInsertQueue.publish({
              table: Duplicate.temporaryTableName,
              values: [
                {
                  criteria: DuplicateCriteria.PRIVATE_PHONE,
                  person_id,
                  duplicate_person_id,
                },
              ],
            });
          });
          stream.on('end', () => {
            resolve();
          });
          stream.on('error', (error) => {
            reject(error);
          });
        });
    });
  }

  async findPeopleWithDuplicatedNameAndAddress(
    database: Database,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      database
        .table('cdb_person AS p1')
        .innerJoin('cdb_gemeindeperson AS gp1', (builder) => {
          builder.on('p1.id', '=', 'gp1.person_id');
        })
        .innerJoin('cdb_person AS p2', (builder) => {
          builder.on('p2.id', '<>', 'p1.id');
        })
        .innerJoin('cdb_gemeindeperson AS gp2', (builder) => {
          builder.on('p2.id', '=', 'gp2.person_id');
        })
        .where('p1.name', '=', 'p2.name')
        .andWhere('p1.vorname', '=', 'p2.vorname')
        .andWhere('p1.strasse', '=', 'p2.strasse')
        .andWhere('p1.plz', '=', 'p2.plz')
        .andWhere('p1.land', '=', 'p2.land')
        .andWhere('p1.zusatz', '=', 'p2.zusatz')
        .andWhere('gp1.geburtsdatum', '=', 'gp2.geburtsdatum')
        .select({
          person_id: 'p1.id',
          duplicate_person_id: 'p2.id',
        })
        .stream((stream) => {
          stream.on('data', async ({ person_id, duplicate_person_id }) => {
            await this.duplicatesInsertQueue.publish({
              table: Duplicate.temporaryTableName,
              values: [
                {
                  criteria: DuplicateCriteria.NAME_AND_ADDRESS,
                  person_id,
                  duplicate_person_id,
                },
              ],
            });
          });
          stream.on('end', () => {
            resolve();
          });
          stream.on('error', (error) => {
            reject(error);
          });
        });
    });
  }
}
