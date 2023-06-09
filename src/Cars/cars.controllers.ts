import { Controller, Get, Req, Post, Body, Delete, Param, Put, UseInterceptors, UploadedFile, Res, HttpStatus, InternalServerErrorException } from '@nestjs/common';
import { Request, Response } from 'express';
import { knex } from 'knex';
import { FileInterceptor } from '@nestjs/platform-express';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as imgfs from 'fs';
import * as uuid from 'uuid';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { Car as CarEntity } from './car'; // Rename the imported Car class to CarEntity

const knexInstance = knex({
  client: 'pg',
  connection: {
    user: 'postgres',
    host: 'localhost',
    database: 'webcoderlider',
    password: 'admin',
    port: 5432,
  },
});

interface Car {
  car_id: string;
  car_price: number;
  cars_color: string;
  cars_description: string;
  cars_distance: number;
  cars_gearbook: string;
  cars_img: string;
  cars_marka: string;
  cars_motor: string;
  cars_tanirovka: string;
  cars_year: number;
  category_id: number;
}

@ApiTags('cars')
@Controller('cars')
export class CarsController {

  @ApiOperation({ summary: 'Get a car by ID' })
  @ApiParam({ name: 'car_id', description: 'Car ID' })
  @ApiResponse({ status: 200, description: 'Success', type: CarEntity })
  @Get('/:car_id')
  async getCar(@Param('car_id') car_id: string): Promise<CarEntity> {
    try {
      const result = await knexInstance<CarEntity>('cars').where('car_id', car_id).first();
      return result; // Return the data
    } catch (error) {
      console.error('Error executing query', error);
      throw new InternalServerErrorException('An error occurred');
    }
  }


  @ApiOperation({ summary: 'Get all cars' })
  @ApiResponse({ status: 200, description: 'Success', type: [CarEntity] })
  @Get()
  async findAll(@Req() request: Request): Promise<Car[]> {
    try {
      const result: Car[] = await knexInstance<Car>('cars').select('*');
      return result; // Return the data
    } catch (error) {
      console.error('Error executing query', error);
      throw new InternalServerErrorException('An error occurred');
    }
  }

  @ApiOperation({ summary: 'Delete a car by ID' })
  @ApiParam({ name: 'id', description: 'Car ID' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 500, description: 'An error occurred' })
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<string> {
    try {
      await knexInstance<Car>('cars').where('car_id', id).del();
      return 'Car deleted successfully';
    } catch (error) {
      console.error('Error executing query', error);
      throw new InternalServerErrorException('An error occurred');
    }
  }

  @ApiOperation({ summary: 'Update a car' })
  @ApiParam({ name: 'id', description: 'Car ID' })
  @ApiBody({ type: CarEntity })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 500, description: 'An error occurred' })
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: Partial<Car> // Use Partial type to allow partial updates
  ): Promise<string> {
    try {
      await knexInstance<Car>('cars').where('car_id', id).update(body);
      return 'Car updated successfully';
    } catch (error) {
      console.error('Error executing query', error);
      throw new InternalServerErrorException('An error occurred');
    }
  }

  @ApiOperation({ summary: 'Get a car image by filename' })
  @ApiParam({ name: 'cars_img', description: 'Car image filename' })
  @ApiResponse({ status: 200, description: 'Success', content: { 'image/*': {} } })
  @ApiResponse({ status: 404, description: 'Car image not found' })
  @Get('img/:cars_img')
  async getCarsImage(@Param('cars_img') carsImg: string, @Res() res: Response): Promise<void> {
    try {
      const result = await knexInstance<Car[]>('cars')
        .select('cars_img')
        .where('cars_img', 'LIKE', `%${carsImg}%`);

      if (result.length > 0) {
        const imagePath = path.join(__dirname, '..', '..', 'uploads', result[0].cars_img);

        const fileStream = imgfs.createReadStream(imagePath);
        fileStream.on('open', () => {
          res.setHeader('Content-Type', 'image/*');
          fileStream.pipe(res);
        });
        fileStream.on('error', (error) => {
          console.error('Error reading image file', error);
          res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('An error occurred');
        });
      } else {
        res.status(HttpStatus.NOT_FOUND).send('Car image not found');
      }
    } catch (error) {
      console.error('Error executing query', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('An error occurred');
    }
  }

  @ApiOperation({ summary: 'Create a new car' })
  @ApiBody({ type: CarEntity })
  @ApiResponse({ status: 201, description: 'Car created successfully' })
  @ApiResponse({ status: 500, description: 'An error occurred' })
  @Post()
  @UseInterceptors(FileInterceptor('cars_img'))
  async create(
    @Body() body: Omit<Car, 'cars_img'>,
    @UploadedFile() file: Express.Multer.File
  ): Promise<string> {
    try {
      const {
        cars_marka,
        cars_tanirovka,
        cars_motor,
        cars_year,
        cars_color,
        cars_distance,
        cars_gearbook,
        cars_description,
        category_id,
        car_price
      } = body;

      const car_id = uuid.v4();

      const fileName = car_id + path.extname(file.originalname);
      const filePath = path.join(__dirname, '..', '..', 'uploads', fileName);
      await fs.writeFile(filePath, file.buffer);

      await knexInstance<Car>('cars').insert({
        car_id,
        cars_marka,
        cars_tanirovka,
        cars_motor,
        cars_year,
        cars_color,
        cars_distance,
        cars_gearbook,
        cars_description,
        cars_img: fileName,
        category_id,
        car_price
      });

      return 'Car created successfully';
    } catch (error) {
      console.error('Error executing query', error);
      throw new InternalServerErrorException('An error occurred');
    }
  }
}
