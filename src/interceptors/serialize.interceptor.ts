import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { nextTick } from 'process';
import { map, Observable } from 'rxjs';
import { UserDto } from 'src/users/dtos/user.dto';

export class SerializeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, handler: CallHandler): Observable<any> {
    // run something before a request is handled by the request handler
    console.log("I'm running before the handler", context);
    return handler.handle().pipe(
      map((data: any) => {
        // Run something before response is sent out
        return plainToClass(UserDto, data, {
          excludeExtraneousValues: true,
        });
      }),
    );
  }
}
