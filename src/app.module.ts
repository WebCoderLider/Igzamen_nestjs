import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CategorysModule } from './Categoriya/categorys.repo';
import { CarsModule } from './Cars/cars.repo';

@Module({
  imports: [
    CategorysModule,
    CarsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
