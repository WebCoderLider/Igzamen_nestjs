import { Controller, Get, Req, Post, Body, Delete, Param, Put, UseInterceptors, UploadedFile, Res, HttpStatus, InternalServerErrorException } from '@nestjs/common';
import { Request, Response } from 'express';
import { Pool } from 'pg';
import { FileInterceptor } from '@nestjs/platform-express';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as imgfs from 'fs';
import * as uuid from 'uuid';

interface Car {
  cars_marka: string;
  cars_tanirovka: string;
  cars_motor: string;
  cars_year: number;
  cars_color: string;
  cars_distance: string;
  cars_gearbook: string;
  cars_description: string;
  cars_img: File;
  category_id: string;
  car_price: number; // Add car_price field
}



@Controller('cars')
export class CarsController {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      user: 'postgres',
      host: 'localhost',
      database: 'webcoderlider',
      password: 'admin',
      port: 5432,
    });
  }


  @Get('/:car_id') // "car" so'zini qo'shing
  async getCar(@Param('car_id') car_id: string): Promise<Car> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        `
        SELECT *
        FROM cars
        WHERE car_id = $1
        `,
        [car_id],
      );
      return result.rows[0]; // Ma'lumotlarni qaytarish
    } catch (error) {
      console.error('Error executing query', error);
      throw new InternalServerErrorException('An error occurred');
    } finally {
      client.release();
    }
  }



  @Get()
  async findAll(@Req() request: Request): Promise<string> {
    const client = await this.pool.connect();
    try {
      const result = await client.query('SELECT * FROM cars');
      return JSON.stringify(result.rows);
    } catch (error) {
      console.error('Error executing query', error);
      return 'An error occurred';
    } finally {
      client.release();
    }
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<string> {
    const client = await this.pool.connect();
    try {
      await client.query('DELETE FROM cars WHERE car_id = $1', [id]);
      return 'Car deleted successfully';
    } catch (error) {
      console.error('Error executing query', error);
      return 'An error occurred';
    } finally {
      client.release();
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: {
      cars_marka?: string;
      cars_tanirovka?: string;
      cars_motor?: string;
      cars_year?: string;
      cars_color?: string;
      cars_distance?: string;
      cars_gearbook?: string;
      cars_description?: string;
      cars_img?: string;
    }
  ): Promise<string> {
    const client = await this.pool.connect();
    try {
      let updateQuery = 'UPDATE cars SET';
      const values: any[] = [];
      const keys = Object.keys(body);
      keys.forEach((key, index) => {
        if (body[key]) {
          updateQuery += ` ${key} = $${index + 1},`;
          values.push(body[key]);
        }
      });
      updateQuery = updateQuery.slice(0, -1); // Remove the last comma
      values.push(id);
      await client.query(updateQuery + ' WHERE car_id = $' + values.length, values);
      return 'Car updated successfully';
    } catch (error) {
      console.error('Error executing query', error);
      return 'An error occurred';
    } finally {
      client.release();
    }
  }



  @Get('img/:cars_img')
  async getCarsImage(@Param('cars_img') carsImg: string, @Res() res: Response): Promise<void> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        `
        SELECT cars_img
        FROM cars
        WHERE cars_img LIKE $1
      `,
        [`%${carsImg}%`],
      );

      if (result.rows.length > 0) {
        const imagePath = path.join(__dirname, '..', '..', 'uploads', result.rows[0].cars_img);

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
    } finally {
      client.release();
    }
  }




  @Post()
  @UseInterceptors(FileInterceptor('cars_img'))
  async create(
    @Body() body: {
      cars_marka: string;
      cars_tanirovka: string;
      cars_motor: string;
      cars_year: number; // Updated field type to number
      cars_color: string;
      cars_distance: string;
      cars_gearbook: string;
      cars_description: string;
      cars_img: string; // Updated field type to string
      category_id: string;
      car_price: number; // Add car_price field
    },
    @UploadedFile() file: Express.Multer.File
  ): Promise<string> {
    const client = await this.pool.connect();
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

      const car_id = uuid.v4(); // Generate a UUID for car_id field

      // Handle file upload using Multer
      const fileName = car_id + path.extname(file.originalname);
      const filePath = path.join(__dirname, '..', '..', 'uploads', fileName);
      await fs.writeFile(filePath, file.buffer);

      const result = await client.query(
        'INSERT INTO cars (car_id, cars_marka, cars_tanirovka, cars_motor, cars_year, cars_color, cars_distance, cars_gearbook, cars_description, cars_img, car_price, category_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *',
        [car_id, cars_marka, cars_tanirovka, cars_motor, cars_year, cars_color, cars_distance, cars_gearbook, cars_description, fileName, car_price, category_id]
      )

      return 'Car created successfully';
    } catch (error) {
      console.error('Error executing query', error);
      return 'An error occurred';
    } finally {
      client.release();
    }


  }
}