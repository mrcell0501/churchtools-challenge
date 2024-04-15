import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Duplicate } from 'src/@database/entities/duplicate.entity';

@Injectable()
export class DuplicatesService {
  constructor(
    @InjectRepository(Duplicate)
    private duplicateRepository: Repository<Duplicate>,
  ) {}

  async findAll() {
    return this.duplicateRepository
      .createQueryBuilder('duplicate')
      .select('duplicate.person_id', 'person_id')
      .addSelect('COUNT(duplicate.id)', 'duplicates_count')
      .addSelect('person.name', 'person_name')
      .addSelect('person.vorname', 'person_vorname')
      .groupBy('duplicate.person_id')
      .leftJoin('duplicate.person', 'person')
      .getRawMany();
  }

  async findAllByPersonId(personId: number) {
    return this.duplicateRepository.find({
      where: { person_id: personId },
      relations: ['duplicate_person'],
    });
  }
}
