import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { ConfigModule } from '@nestjs/config';
import *as dotenv from 'dotenv';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:`.env.${process.env.NODE_ENV || 'development'}`,
      load:[() => dotenv.config({path:'.env'})]
    })
  ],
  controllers: [UserController],
  providers: [UserService],
  // exports: [UserService]
})
export class UserModule {}
