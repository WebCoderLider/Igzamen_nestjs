import { Module } from '@nestjs/common';
import { CarsController } from './cars.controllers';
import { CatsService } from './cars.service';

@Module({
  controllers: [CarsController],
  providers: [CatsService],
})
export class CarsModule {}