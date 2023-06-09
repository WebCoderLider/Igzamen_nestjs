import { Controller, Get, Post, Body } from '@nestjs/common';
import { likedDto } from './liked.dto';
import { knexInstance } from './knexInstance';

@Controller('liked')
export class LikedController {
  @Get()
  async getLikedUsers(): Promise<{ username: string; user_id: string; liked_id: string }[]> {
    const likedUsers = await knexInstance.select().from('liked');
    return likedUsers;
  }

  @Post()
  async addLikedUser(@Body() body: likedDto): Promise<void> {
    const { username, user_id, liked_id } = body;
    await knexInstance('liked').insert({ username, user_id, liked_id });
  }
}
