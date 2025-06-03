import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import *as dotenv from 'dotenv';
import *as Joi from 'joi';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal:true,
    envFilePath:`.env.${process.env.NODE_ENV || 'development'}`,
    load:[() => dotenv.config({path:'.env'})],
    validationSchema: Joi.object({
      DB_PORT: Joi.number().default(3306),
    })
  }),UserModule],
  controllers: [],
  providers: []
})
export class AppModule {}
