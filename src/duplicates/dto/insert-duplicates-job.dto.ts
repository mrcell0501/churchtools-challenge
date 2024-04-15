import { Duplicate } from 'src/@database/entities/duplicate.entity';

type InsertData = Pick<
  Duplicate,
  'person_id' | 'duplicate_person_id' | 'criteria'
>;

export type InsertDuplicatesJobDto = {
  table: string;
  values: InsertData[];
};
