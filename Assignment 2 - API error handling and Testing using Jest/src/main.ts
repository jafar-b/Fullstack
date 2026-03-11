import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from './common/pipes/validation.pipe';
import { HttpExceptionFilter } from './common/filters/exception.filter';
import { ThrottlerExceptionFilter } from './common/filters/throttler.filter';
import { ServiceUnavailableExceptionFilter } from './common/filters/service-unavailable.filter';
import { UnprocessableEntityExceptionFilter } from './common/filters/unprocessable-entity.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());

  app.useGlobalFilters(
    new UnprocessableEntityExceptionFilter(),
    // new ThrottlerExceptionFilter(),
    new ServiceUnavailableExceptionFilter(),
    new HttpExceptionFilter(),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
