import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

const cookieSession = require('cookie-session');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // setting up cookie session
  app.use(
    cookieSession({
      keys: ['random_string'],
    }),
  );
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // this will strip out any extra property send in the request
    }),
  );
  await app.listen(3000);
}
bootstrap();
