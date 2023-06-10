import { Module } from '@nestjs/common';
import { AdminService } from './admin.srvice';
import { JwtModule } from '@nestjs/jwt'; // JwtModule import qilingan
import { AdminController } from './admin.controllers';

@Module({
  imports: [
    JwtModule.register({
      secret: 'your_secret_key',
      signOptions: { expiresIn: '1d' },
    }),
  ], // JwtModule ni imports ga qo'shing
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule { }
