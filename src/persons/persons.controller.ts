import { Controller, Get, Param } from '@nestjs/common';
import { PersonsService } from './persons.service';
import { DuplicatesService } from 'src/duplicates/duplicates.service';

@Controller('persons')
export class PersonsController {
  constructor(
    private readonly personsService: PersonsService,
    private readonly duplicatesService: DuplicatesService,
  ) {}

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.personsService.findOne(+id);
  }

  @Get(':id/duplicates')
  async findAllDuplicates(@Param('id') id: string) {
    const duplicates = await this.duplicatesService.findAllByPersonId(+id);

    return {
      total: duplicates.length,
      data: duplicates.map((row) => ({
        ...row,
        '@links': [
          { rel: 'self', path: `/persons/${row.person_id}/duplicates` },
          { rel: 'person', path: `/persons/${row.person_id}` },
          {
            rel: 'duplicate_person',
            path: `/persons/${row.duplicate_person_id}`,
          },
        ],
      })),
    };
  }
}
