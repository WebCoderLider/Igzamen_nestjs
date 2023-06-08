import { Controller, Get, Req, Post, Body, Delete, Param, Put, UploadedFile, UseInterceptors, Res, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { knex } from 'knex';
import * as uuid from 'uuid';
import fs from 'fs';
import path from 'path';
import { ApiTags } from '@nestjs/swagger';

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


@ApiTags('Categories')
@Controller('categories')
export class CategoryController {
  @Get('/uploads/:category_img') // URL manzilini "uploads/:category_img" ga o'zgartirish
  async getCategoryImage(@Param('category_img') categoryImg: string, @Res() res: Response): Promise<void> {
    try {
      const result = await knexInstance('categories')
        .select('category_img')
        .where('category_img', 'LIKE', `%uploads/${categoryImg}%`); // Fayl nomini qidirish uchun "uploads/:category_img" ga o'zgartirish

      if (result.length > 0) {
        const imagePath = path.join(__dirname, '..', '..', result[0].category_img);
        const imageStream = fs.createReadStream(imagePath);
        imageStream.pipe(res);
      } else {
        res.status(HttpStatus.NOT_FOUND).send('Category image not found');
      }
    } catch (error) {
      console.error('Error executing query', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('An error occurred');
    }
  }


  @Get(':category_id') // URL manzilini ":category_id" ga o'zgartirish
async findOne(@Param('category_id') categoryId: string): Promise<string> {
  try {
    const result = await knexInstance.raw(
      `
        SELECT categories.*, json_agg(cars.*) AS cars
        FROM categories
        LEFT JOIN cars ON categories.category_id = cars.category_id
        WHERE categories.category_id = :categoryId
        GROUP BY categories.category_id
      `,
      { categoryId } // Parameter binding using object notation
    );

    if (result.rows.length > 0) {
      return JSON.stringify(result.rows[0], null, 2);
    } else {
      return 'Category not found';
    }
  } catch (error) {
    console.error('Error executing query', error);
    return 'An error occurred';
  }
}





  @Get()
  async findAll(@Req() request: Request): Promise<string> {
    try {
      const result = await knexInstance.raw(`
        SELECT categories.*, json_agg(cars.*) AS cars
        FROM categories
        LEFT JOIN cars ON categories.category_id = cars.category_id
        GROUP BY categories.category_id
      `);
      return JSON.stringify(result.rows, null, 2);
    } catch (error) {
      console.error('Error executing query', error);
      return 'An error occurred';
    }
  }

  

  @Post()
  @UseInterceptors(FileInterceptor('category_img'))
  async create(@Req() request: Request, @UploadedFile() categoryImg: Express.Multer.File): Promise<string> {
    const { category_name } = request.body;
    const id = uuid.v4();
    try {
      let categoryImgPath: string = null; // Fayl nomini saqlash uchun o'zgaruvchi

      if (categoryImg) {
        const fileExtension = categoryImg.originalname.split('.').pop();
        const uploadPath = `uploads/${id}.${fileExtension}`;
        fs.writeFileSync(uploadPath, categoryImg.buffer);
        categoryImgPath = uploadPath;
      }

      await knexInstance('categories').insert({
        category_id: id,
        category_name,
        category_img: categoryImgPath, // Fayl nomini ma'lumotlar bazasiga saqlang
      });

      return 'Category created successfully';
    } catch (error) {
      console.error('Error executing query', error);
      return 'An error occurred';
    }
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<string> {
    try {
      await knexInstance('categories').where('category_id', id).del();
      return 'Category deleted successfully';
    } catch (error) {
      console.error('Error executing query', error);
      return 'An error occurred';
    }
  }

  @Put(':id') //tahrirlash
  async update(@Param('id') id: string, @Body() body: { category_name: string; category_img?: string }): Promise<string> {
    const { category_name, category_img } = body;
    try {
      if (category_img) {
        const fileExtension = category_img.split('.').pop();
        const newCategoryImg = `${uuid.v4()}.${fileExtension}`;
        await knexInstance('categories').where('category_id', id).update({
          category_name,
          category_img: newCategoryImg,
        });
      } else {
        await knexInstance('categories').where('category_id', id).update({ category_name });
      }
      return 'Category updated successfully';
    } catch (error) {
      console.error('Error executing query', error);
      return 'An error occurred';
    }
  }
}
