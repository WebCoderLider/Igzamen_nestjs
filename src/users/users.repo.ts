import { Module } from '@nestjs/common';
import { UsersController } from './users.controllers';
import { UsersService } from './users.service';
import { JwtModule } from '@nestjs/jwt'; // JwtModule import qilingan

@Module({
  imports: [JwtModule], // JwtModule ni imports ga qo'shing
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
