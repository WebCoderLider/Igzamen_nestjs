import { Controller, Get, Post, Body, Delete, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { likedDto } from './liked.dto';
import { knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';

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

@ApiTags('Liked')
@Controller('liked')
export class LikedController {
  @Get()
  @ApiOperation({ summary: 'Get all liked users' })
  async getLikedUsers(): Promise<{ username: string; user_id: string; liked_id: string; car_id: string }[]> {
    const likedUsers = await knexInstance.select().from('liked');
    return likedUsers;
  }

  @Delete('/:liked_id')
  @ApiOperation({ summary: 'Delete a liked user' })
  async deleteLikedUser(@Param('liked_id') liked_id: string): Promise<void> {
    await knexInstance('liked')
      .where('liked_id', '=', liked_id)
      .del();
  }

  @Post()
  @ApiOperation({ summary: 'Add a liked user' })
  async addLikedUser(@Body() body: likedDto): Promise<void> {
    const { username, user_id, car_id } = body;

    const existingLikedUser = await knexInstance('liked')
      .where('user_id', '=', user_id)
      .first();

    if (existingLikedUser) {
      throw new Error('User already exists');
    }

    const liked_id = uuidv4(); // Generate a new UUID
    await knexInstance('liked').insert({ liked_id, username, user_id, car_id });
  }
}
