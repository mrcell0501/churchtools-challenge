import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';
import { DuplicateCriteria } from '../entities/duplicate.entity';

export class CreateDuplicateTable1713206764666 implements MigrationInterface {
  private tableName = 'duplicate';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: this.tableName,
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'person_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'duplicate_person_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'criteria',
            type: 'enum',
            enum: Object.values(DuplicateCriteria),
            isNullable: false,
          },
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['person_id'],
            referencedTableName: 'cdb_person',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
          new TableForeignKey({
            columnNames: ['duplicate_person_id'],
            referencedTableName: 'cdb_person',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(this.tableName);
  }
}
