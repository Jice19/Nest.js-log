import { Controller, Get, Post} from '@nestjs/common';
import { UserService } from './user.service';
import { ConfigService } from '@nestjs/config';
import { ConfigEnum } from '../enum/config.enum';

@Controller('user')
export class UserController {

  constructor(
    private readonly useService: UserService,
    private readonly ConfigService: ConfigService
  ) {}
  @Get('test')
  getUsers(): any {
    const db = this.ConfigService.get(ConfigEnum.DB)
    const host_db = this.ConfigService.get(ConfigEnum.DB_HOST)
    console.log(db);
    console.log(host_db);
    
    const url = this.ConfigService.get('DB_URL');
    console.log(url);
    
    return this.useService.getUsers();
  }

  @Post() 
  postUsers(): any {
    return this.useService.postUsers();
  }

  @Get('range')
  postNum(): any {
    return this.useService.postNum();
  }
}
