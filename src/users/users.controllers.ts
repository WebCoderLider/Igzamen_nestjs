import { Controller, Get, Req, Post, Body, Delete, Param, Put, UploadedFile, UseInterceptors, Res, HttpStatus, UnauthorizedException, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { knex } from 'knex';
import * as uuid from 'uuid';
import fs from 'fs';
import path from 'path';
import { JwtPayload } from 'jsonwebtoken';

import { ApiBody, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateUserDto, UpdateUserDto } from './users.dto';
import { sign, verify } from 'jsonwebtoken';
import { compare, hash } from 'bcryptjs';

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
export class TokenDto {
  token: string;
}


@ApiTags('users')
@Controller('users')
export class UsersController {

  @Post('verify')
  @ApiBody({ type: TokenDto })
  @ApiResponse({ status: 200, description: 'Token verification successful' })
  @ApiResponse({ status: 401, description: 'Token verification failed' })
  async verifyToken(@Body() body: TokenDto): Promise<{ message: string }> {
    const { token } = body;
    try {
      const decoded: JwtPayload = verify(token, 'your_secret_key') as JwtPayload;
      const { user_id } = decoded;

      console.log(user_id);
      return ({
        message: user_id
      })
    } catch (error) {
      return { message: 'Token verification failed' };
    }
  }







  @Get('/uploads/:user_img')
  @ApiParam({ name: 'user_img', type: 'string', description: 'User image filename' })
  @ApiResponse({ status: 200, description: 'User image found' })
  @ApiResponse({ status: 404, description: 'User image not found' })
  async getUserImage(@Param('user_img') userImg: string, @Res() res: Response): Promise<void> {
    try {
      const result = await knexInstance('users')
        .select('user_img')
        .where('user_img', 'LIKE', `%uploads/${userImg}%`);

      if (result.length > 0) {
        const imagePath = path.join(__dirname, '..', '..', result[0].user_img);
        const imageStream = fs.createReadStream(imagePath);
        imageStream.pipe(res);
      } else {
        res.status(HttpStatus.NOT_FOUND).send('User image not found');
      }
    } catch (error) {
      console.error('Error executing query', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('An error occurred');
    }
  }

  @Get(':user_id')
  @ApiParam({ name: 'user_id', type: 'string', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('user_id') userId: string): Promise<string> {
    try {
      const result = await knexInstance('users').where('user_id', userId).first();

      if (result) {
        return JSON.stringify(result, null, 2);
      } else {
        return 'User not found';
      }
    } catch (error) {
      console.error('Error executing query', error);
      return 'An error occurred';
    }
  }




  @Get()
  @ApiResponse({ status: 200, description: 'Users found' })
  async findAll(): Promise<string> {
    try {
      const result = await knexInstance('users').select();

      return JSON.stringify(result, null, 2);
    } catch (error) {
      console.error('Error executing query', error);
      return 'An error occurred';
    }
  }

  @Post()
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 500, description: 'An error occurred' })
  @UseInterceptors(FileInterceptor('user_img'))
  async create(
    @Body() body: { username: string; user_email: string; user_password: string },
    @UploadedFile() userImg: Express.Multer.File,
  ): Promise<{ message: string; token: string }> {
    const { username, user_email, user_password } = body;
    const id = uuid.v4();
    try {
      // Hash the user password
      const hashedPassword = await hash(user_password, 10);

      let userImgPath: string = null;

      if (userImg) {
        const fileExtension = userImg.originalname.split('.').pop();
        const uploadPath = `uploads/${id}.${fileExtension}`;
        fs.writeFileSync(uploadPath, userImg.buffer);
        userImgPath = uploadPath;
      }

      await knexInstance('users').insert({
        user_id: id,
        username,
        user_email,
        user_password: hashedPassword,
        user_img: userImgPath,
      });

      // Generate a JWT token
      const token = sign({ user_id: id }, 'your_secret_key', { expiresIn: '2h' });

      return { message: 'User created successfully', token };
    } catch (error) {
      console.error('Error executing query', error);
      return { message: 'An error occurred', token: null };
    }
  }

  @Post('login')
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() body: { username: string; user_password: string }): Promise<{ message: string; token: string }> {
    const { username, user_password } = body;
    try {
      // Retrieve the user from the database
      const user = await knexInstance('users').where('username', username).first();

      if (user) {
        // Compare the provided password with the hashed password from the database
        const passwordMatch = await compare(user_password, user.user_password);

        if (passwordMatch) {
          // Generate a JWT token
          const token = sign({ user_id: user.user_id }, 'your_secret_key', { expiresIn: '2h' });

          return { message: 'Login successful', token };
        } else {
          return { message: 'Invalid credentials', token: null };
        }
      } else {
        return { message: 'Invalid credentials', token: null };
      }
    } catch (error) {
      console.error('Error executing query', error);
      return { message: 'An error occurred', token: null };
    }
  }



  @Delete(':id')
  @ApiParam({ name: 'id', type: 'string', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async delete(@Param('id') id: string): Promise<string> {
    try {
      await knexInstance('users').where('user_id', id).del();
      return 'User deleted successfully';
    } catch (error) {
      console.error('Error executing query', error);
      return 'An error occurred';
    }
  }

  @Put(':id')
  @ApiParam({ name: 'id', type: 'string', description: 'User ID' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async update(@Param('id') id: string, @Body() body: { username: string; user_email: string; user_img?: string }): Promise<string> {
    const { username, user_email, user_img } = body;
    try {
      if (user_img) {
        const fileExtension = user_img.split('.').pop();
        const newUserImg = `${uuid.v4()}.${fileExtension}`;
        await knexInstance('users').where('user_id', id).update({
          username,
          user_email,
          user_img: newUserImg,
        });
      } else {
        await knexInstance('users').where('user_id', id).update({ username, user_email });
      }
      return 'User updated successfully';
    } catch (error) {
      console.error('Error executing query', error);
      return 'An error occurred';
    }
  }
}
