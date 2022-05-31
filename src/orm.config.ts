import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { config } from 'dotenv';

config();
export const TypeOrmConfig: TypeOrmModuleOptions = {
  url: process.env.DATABASE_URL,
  type: 'postgres',
  extra: {
    ssl: {
      rejectUnauthorized: false,
    },
  },
  synchronize: false,
  entities: ['dist/**/*.entity{.ts,.js}'],
};
