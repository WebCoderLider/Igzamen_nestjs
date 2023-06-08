import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CategorysModule } from './Categoriya/categorys.repo';
import { CarsModule } from './Cars/cars.repo';
import { UsersModule } from './users/users.repo';
import cors from 'cors';

@Module({
  imports: [
    CategorysModule,
    CarsModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(cors())
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
