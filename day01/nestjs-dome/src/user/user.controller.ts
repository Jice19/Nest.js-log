import { Controller, Get, Post} from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {

  constructor(private useService: UserService) {}
  @Get()
  getUsers(): any {
    return this.useService.getUsers();
  }

  @Post() 
  postUsers(): any {
    return this.useService.postUsers();
  }
}
