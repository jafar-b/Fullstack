import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { ThrottlerException } from '@nestjs/throttler';

@Catch(ThrottlerException)
export class ThrottlerExceptionFilter implements ExceptionFilter {
  catch(exception: ThrottlerException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const status = HttpStatus.TOO_MANY_REQUESTS;

    response.status(status).json({
      success: false,
      statusCode: status,
      message: 'Too many requests - Please try again later',
      retryAfter: 60,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
