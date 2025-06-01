import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {

  getUsers(): any {
    return { message: 'Hello users!', code: 200 };
  }
  postUsers(): any {
    return { message: 'Hello post!', code: 200 };
  }
}
