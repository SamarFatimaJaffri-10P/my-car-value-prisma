import { MiddlewareConsumer, Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ReportsModule } from './reports/reports.module';
import { UsersModule } from './users/users.module';
import cookieSession = require('cookie-session');

@Module({
  // NOTE: modules group together code
  imports: [
    // config information
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`, // NODE_ENV is test in test environment and development in develop env
    }),
    UsersModule,
    ReportsModule,
    PrismaModule,
  ],
  controllers: [AppController], // NOTE: controllers handles incoming requests
  providers: [
    AppService, // NOTE: services handles data access and business logic
    // setting up global pipe
    // NOTE: pipes validates incoming data
    {
      // this is a syntax to specify the providers
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true, // this will strip out any extra property send in the request
      }),
    },
  ],
})
export class AppModule {
  constructor(private configService: ConfigService) {}

  // NOTE: Middleware is a function which is called before the route handler (after client request)
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        // setting up cookie session
        cookieSession({
          keys: [this.configService.get('COOKIE_KEY')],
        }),
      )
      .forRoutes('*');
  }
}
