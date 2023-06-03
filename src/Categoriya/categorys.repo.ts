import { Module } from '@nestjs/common';
import { CategoryController } from './categorys.controllers';
import { CatsService } from './categorys.service';

@Module({
  controllers: [CategoryController],
  providers: [CatsService],
})
export class CategorysModule {}