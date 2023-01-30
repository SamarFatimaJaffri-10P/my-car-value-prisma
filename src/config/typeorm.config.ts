import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: process.env.NODE_ENV == 'production' ? 'postgres' : 'sqlite',
      synchronize: process.env.NODE_ENV == 'test' ? true : false,
      database: this.configService.get<string>('DB_NAME'),
      autoLoadEntities: true,
    };
  }
}
