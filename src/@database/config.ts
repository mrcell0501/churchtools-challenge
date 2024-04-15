import { registerAs } from '@nestjs/config';
import { config as dotenvConfig } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

dotenvConfig();

const config: DataSourceOptions = {
  type: 'mysql',
  host: 'database',
  port: 3306,
  username: 'root',
  password: 'root',
  database: 'churchtools',
  entities: ['dist/@database/entities/*.entity.js'],
  migrations: ['dist/@database/migrations/*{.ts,.js}'],
  migrationsTableName: 'duplicate-ms-migration',
  synchronize: false,
};

export default registerAs('database', () => config);
export const connectionSource = new DataSource(config);
