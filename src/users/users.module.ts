import { MiddlewareConsumer, Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthService } from './auth.service';
import { CurrentUserMiddleware } from './middlewares/current-user.middleware';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [PrismaModule],
  controllers: [UsersController],
  providers: [UsersService, AuthService],
})
export class UsersModule {
  configure(consumer: MiddlewareConsumer) {
    // NOTE: Middleware is a function which is called before the route handler (after client request)
    consumer.apply(CurrentUserMiddleware).forRoutes('*');
  }
}
