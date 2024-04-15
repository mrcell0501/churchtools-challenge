import { Controller, Get } from '@nestjs/common';
import { DuplicatesService } from './duplicates.service';

@Controller('duplicates')
export class DuplicatesController {
  constructor(private readonly duplicatesService: DuplicatesService) {}

  @Get()
  async findAll() {
    const duplicates = await this.duplicatesService.findAll();

    return {
      total: duplicates.length,
      data: duplicates.map((row) => ({
        ...row,
        duplicates_count: Number(row.duplicates_count),
        '@links': [
          { rel: 'self', path: `/persons/${row.person_id}/duplicates` },
          { rel: 'person', path: `/persons/${row.person_id}` },
        ],
      })),
    };
  }
}
