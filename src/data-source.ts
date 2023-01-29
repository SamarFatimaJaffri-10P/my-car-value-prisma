import { DataSource, DataSourceOptions } from 'typeorm';

export const appDataSource = new DataSource({
  type: 'sqlite',
  database:
    process.env.NODE_ENV === 'development' ? 'db.sqlite' : 'test.sqlite',
  entities: ['**/*.entity.ts'],
  migrations: [__dirname + '/migrations/*.ts'],
} as DataSourceOptions);
