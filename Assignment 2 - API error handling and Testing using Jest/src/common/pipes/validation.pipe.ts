import {
  Injectable,
  ValidationPipe as NestValidationPipe,
  UnprocessableEntityException,
  ValidationError,
} from '@nestjs/common';

@Injectable()
export class ValidationPipe extends NestValidationPipe {
  constructor() {
    super({
      exceptionFactory: (errors: ValidationError[]) => {
        const formattedErrors = errors.map((error) => ({
          field: error.property,
          message: Object.values(error.constraints || {}).join(', '),
        }));
        return new UnprocessableEntityException(formattedErrors);
      },
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    });
  }
}
