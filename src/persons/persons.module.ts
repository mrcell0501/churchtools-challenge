import { Module } from '@nestjs/common';
import { PersonsService } from './persons.service';
import { PersonsController } from './persons.controller';
import { Person } from 'src/@database/entities/person.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DuplicatesModule } from 'src/duplicates/duplicates.module';

@Module({
  controllers: [PersonsController],
  providers: [PersonsService],
  imports: [DuplicatesModule, TypeOrmModule.forFeature([Person])],
})
export class PersonsModule {}
