import { Controller, Get, Req, Post, Body, Delete, Param, Put } from '@nestjs/common';
import { Request } from 'express';
import { Pool } from 'pg';
import * as uuid from 'uuid';

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

  @Post()
  async create(@Body() body: {
    cars_marka: string,
    cars_tanirovka: string,
    cars_motor: string,
    cars_year: string,
    cars_color: string,
    cars_distance: string,
    cars_gearbook: string,
    cars_description: string,
    cars_img: string,
  }): Promise<string> {
    const {
      cars_marka,
      cars_tanirovka,
      cars_motor,
      cars_year,
      cars_color,
      cars_distance,
      cars_gearbook,
      cars_description,
      cars_img,
    } = body;
    const id = uuid.v4();
    const client = await this.pool.connect();
    try {
      await client.query(
        'INSERT INTO cars (car_id, cars_marka, cars_tanirovka, cars_motor, cars_year, cars_color, cars_distance, cars_gearbook, cars_description, cars_img) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
        [id, cars_marka, cars_tanirovka, cars_motor, cars_year, cars_color, cars_distance, cars_gearbook, cars_description, cars_img]
      );
      return 'Car created successfully';
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
  async update(@Param('id') id: string, @Body() body: {
    cars_marka?: string,
    cars_tanirovka?: string,
    cars_motor?: string,
    cars_year?: string,
    cars_color?: string,
    cars_distance?: string,
    cars_gearbook?: string,
    cars_description?: string,
    cars_img?: string,
  }): Promise<string> {
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
      updateQuery = updateQuery.slice(0, -1); // So'nggi vergulni olib tashlash
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
}
