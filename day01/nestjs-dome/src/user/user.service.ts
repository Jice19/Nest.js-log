import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {

  getUsers(): any {
    return { message: 'Hello users!', code: 300 };
  }
  postUsers(): any {
    return { message: 'Hello post!', code: 200 };
  }
  postNum(): any{
    return {
      code:0,
      msg:"请求成功",
      data:["1","2","3","4","5","6","7","8","9","10"]
    }
  }
}
