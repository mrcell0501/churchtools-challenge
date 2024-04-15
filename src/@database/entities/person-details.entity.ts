import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Person } from './person.entity';

@Entity('cdb_gemeindeperson')
export class PersonDetails {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  person_id: number;

  @Column()
  geburtsdatum: Date;

  @OneToOne(() => Person)
  @JoinColumn({ name: 'person_id' })
  person: Person;
}
