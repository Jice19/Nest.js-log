import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  constructor(private readonly appService: any) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('app')
  getapp(): any {
    return {
      message: 'Hello World!',
      code: 200}
  }
}
