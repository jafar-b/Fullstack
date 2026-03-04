import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  ServiceUnavailableException,
} from '@nestjs/common';

@Catch(ServiceUnavailableException)
export class ServiceUnavailableExceptionFilter implements ExceptionFilter {
  catch(exception: ServiceUnavailableException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const status = HttpStatus.SERVICE_UNAVAILABLE;

    response.status(status).json({
      success: false,
      statusCode: status,
      message: exception.message || 'Service temporarily unavailable',
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
