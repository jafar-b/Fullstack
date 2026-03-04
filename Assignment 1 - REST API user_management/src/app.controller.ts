import { Controller, ServiceUnavailableException, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  @Get('test-503')
  test503() {
  throw new ServiceUnavailableException('Database connection lost');
}

}
