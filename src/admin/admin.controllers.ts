import { Controller, Get, Req, Post, Body, Delete, Param, Put, UploadedFile, UseInterceptors, Res, HttpStatus, UnauthorizedException, UseGuards } from '@nestjs/common';
import { knex } from 'knex';
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
export class TokenDto {
    token: string;
}


@ApiTags('admin')
@Controller('admin')
export class UsersController {
    
}