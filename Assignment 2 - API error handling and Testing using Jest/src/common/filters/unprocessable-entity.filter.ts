import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ValidationError } from 'class-validator';

@Catch(UnprocessableEntityException)
export class UnprocessableEntityExceptionFilter implements ExceptionFilter {
  catch(exception: UnprocessableEntityException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = HttpStatus.UNPROCESSABLE_ENTITY;

    const exceptionResponse = exception.getResponse();
    const errors = this.formatErrors(exceptionResponse);

    response.status(status).json({
      success: false,
      statusCode: status,
      message: 'Validation failed',
      errors,
    });
  }

  private formatErrors(response: string | object): any {
    if (typeof response === 'string') {
      return [{ message: response }];
    }

    if (Array.isArray(response)) {
      return response.map((error) => {
        if (error instanceof ValidationError) {
          return {
            field: error.property,
            message: Object.values(error.constraints || {}).join(', '),
          };
        }
        return { message: error };
      });
    }

    if (response && typeof response === 'object' && 'message' in response) {
      const message = (response as any).message;
      if (Array.isArray(message)) {
        return message.map((msg) => ({ message: msg }));
      }
      return [{ message }];
    }

    return [{ message: 'Validation error' }];
  }
}
