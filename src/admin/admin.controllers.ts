import { Controller, Post, Body, UnauthorizedException, Put, Param, NotFoundException, Get } from '@nestjs/common';
import { knex } from 'knex';
import { TokenDto } from './token.dto';
import { ApiTags } from '@nestjs/swagger';
import { JwtService } from '@nestjs/jwt';

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

@ApiTags('admin')
@Controller('admin')
export class AdminController {
  constructor(private jwtService: JwtService) { }

  @Get()
  async getAllUsers(): Promise<any[]> {
    const users = await knexInstance('admin').select('*');
    return users;
  }

  @Post('login')
  async login(@Body() body: { username: string; password: string }): Promise<TokenDto> {
    const { username, password } = body;

    const user = await knexInstance('admin').where('username', username).first();

    if (user && user.password === password) {
      const payload = { username: user.username, sub: user.username };
      const token = this.jwtService.sign(payload);

      const tokenDto: TokenDto = {
        token: token,
      };
      return tokenDto;
    } else {
      throw new UnauthorizedException('Login or password is incorrect');
    }
  }

  @Put(':id/password')
  async updatePassword(
    @Param('id') id: string,
    @Body() body: { username: string; password: string },
  ): Promise<string> {
    const { username, password } = body;

    const user = await knexInstance('admin').where('id', id).first();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await knexInstance('admin').where('id', id).update({ username, password });

    return 'Password and username updated successfully';
  }


}
