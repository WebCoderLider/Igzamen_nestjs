import { Controller, Get, Req, Post, Body, Delete, Param, Put } from '@nestjs/common';
import { Request } from 'express';
import { Pool } from 'pg';
import * as uuid from 'uuid';

@Controller('categories')
export class CategoryController {
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
      const result = await client.query('SELECT * FROM categories');
      return JSON.stringify(result.rows);
    } catch (error) {
      console.error('Error executing query', error);
      return 'An error occurred';
    } finally {
      client.release();
    }
  }

  @Post()
  async create(@Body() body: { category_name: string, category_img: string }): Promise<string> {
    const { category_name, category_img } = body;
    const id = uuid.v4();
    const client = await this.pool.connect();
    try {
      await client.query('INSERT INTO categories (category_id, category_name, category_img) VALUES ($1, $2, $3)', [id, category_name, category_img]);
      return 'Category created successfully';
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
      await client.query('DELETE FROM categories WHERE category_id = $1', [id]);
      return 'Category deleted successfully';
    } catch (error) {
      console.error('Error executing query', error);
      return 'An error occurred';
    } finally {
      client.release();
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: { category_name: string, category_img: string }): Promise<string> {
    const { category_name, category_img } = body;
    const client = await this.pool.connect();
    try {
      await client.query('UPDATE categories SET category_name = $1, category_img = $2 WHERE category_id = $3', [category_name, category_img, id]);
      return 'Category updated successfully';
    } catch (error) {
      console.error('Error executing query', error);
      return 'An error occurred';
    } finally {
      client.release();
    }
  }
}
