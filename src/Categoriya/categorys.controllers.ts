import { Controller, Get, Req, Post, Body, Delete, Param, Put, UploadedFile, UseInterceptors, Res, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { Pool } from 'pg';
import * as uuid from 'uuid';
import fs from 'fs';
import path from 'path';

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


  @Get('/uploads/:category_img') // URL manzilini "uploads/:category_img" ga o'zgartirish
  async getCategoryImage(@Param('category_img') categoryImg: string, @Res() res: Response): Promise<void> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        `
      SELECT category_img
      FROM categories
      WHERE category_img LIKE $1
    `,
        [`%uploads/${categoryImg}%`], // Fayl nomini qidirish uchun "uploads/:category_img" ga o'zgartirish
      );

      if (result.rows.length > 0) {
        const imagePath = path.join(__dirname, '..', '..', result.rows[0].category_img);
        const imageStream = fs.createReadStream(imagePath);
        imageStream.pipe(res);
      } else {
        res.status(HttpStatus.NOT_FOUND).send('Category image not found');
      }
    } catch (error) {
      console.error('Error executing query', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('An error occurred');
    } finally {
      client.release();
    }
  }


  @Get()
  async findAll(@Req() request: Request): Promise<string> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(`
        SELECT categories.*, json_agg(cars.*) AS cars
        FROM categories
        LEFT JOIN cars ON categories.category_id = cars.category_id
        GROUP BY categories.category_id
      `);
      return JSON.stringify(result.rows, null, 2);
    } catch (error) {
      console.error('Error executing query', error);
      return 'An error occurred';
    } finally {
      client.release();
    }
  }







  @Get(':category_id')
  async findOne(@Param('category_id') categoryId: string): Promise<string> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        `
          SELECT categories.*, json_agg(cars.*) AS cars
          FROM categories
          LEFT JOIN cars ON categories.category_id = cars.category_id
          WHERE categories.category_id = $1
          GROUP BY categories.category_id
        `,
        [categoryId],
      );

      if (result.rows.length > 0) {
        return JSON.stringify(result.rows[0], null, 2);
      } else {
        return 'Category not found';
      }
    } catch (error) {
      console.error('Error executing query', error);
      return 'An error occurred';
    } finally {
      client.release();
    }
  }

  @Post()
  @UseInterceptors(FileInterceptor('category_img'))
  async create(@Req() request: Request, @UploadedFile() categoryImg: Express.Multer.File): Promise<string> {
    const { category_name } = request.body;
    const id = uuid.v4();
    const client = await this.pool.connect();
    try {
      let categoryImgPath: string = null; // Fayl nomini saqlash uchun o'zgaruvchi

      if (categoryImg) {
        const fileExtension = categoryImg.originalname.split('.').pop();
        const uploadPath = `uploads/${id}.${fileExtension}`;
        fs.writeFileSync(uploadPath, categoryImg.buffer);
        categoryImgPath = uploadPath;
      }

      await client.query('INSERT INTO categories (category_id, category_name, category_img) VALUES ($1, $2, $3)', [
        id,
        category_name,
        categoryImgPath, // Fayl nomini ma'lumotlar bazasiga saqlang
      ]);

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
  async update(
    @Param('id') id: string,
    @Body() body: { category_name: string; category_img?: string },
  ): Promise<string> {
    const { category_name, category_img } = body;
    const client = await this.pool.connect();
    try {
      if (category_img) {
        const fileExtension = category_img.split('.').pop();
        const newCategoryImg = `${uuid.v4()}.${fileExtension}`;
        await client.query('UPDATE categories SET category_name = $1, category_img = $2 WHERE category_id = $3', [
          category_name,
          newCategoryImg,
          id,
        ]);
      } else {
        await client.query('UPDATE categories SET category_name = $1 WHERE category_id = $2', [category_name, id]);
      }
      return 'Category updated successfully';
    } catch (error) {
      console.error('Error executing query', error);
      return 'An error occurred';
    } finally {
      client.release();
    }
  }
}
