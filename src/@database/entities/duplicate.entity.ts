import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Person } from './person.entity';

export enum DuplicateCriteria {
  EMAIL = 'EMAIL',
  PRIVATE_PHONE = 'PRIVATE_PHONE',
  NAME_AND_ADDRESS = 'NAME_AND_ADDRESS',
}

const tableName = 'duplicate';

@Entity(tableName)
export class Duplicate {
  public static tableName = tableName;
  public static temporaryTableName = `${Duplicate.tableName}_tmp`;

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  person_id: number;

  @Column({ enum: Object.values(DuplicateCriteria) })
  criteria: DuplicateCriteria;

  @Column()
  duplicate_person_id: number;

  @OneToOne(() => Person)
  @JoinColumn({ name: 'duplicate_person_id' })
  duplicate_person: Person;

  @OneToOne(() => Person)
  @JoinColumn({ name: 'person_id' })
  person: Person;
}
