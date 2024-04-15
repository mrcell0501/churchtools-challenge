import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PersonDetails } from './person-details.entity';

@Entity('cdb_person')
export class Person {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  vorname: string;

  @Column()
  email: string;

  @Column({})
  strasse: string;

  @Column()
  plz: string;

  @Column()
  land: string;

  @Column()
  zusatz: string;

  @Column()
  telefonprivat: string;

  @OneToOne(() => PersonDetails, (pd) => pd.person)
  details: PersonDetails;
}
