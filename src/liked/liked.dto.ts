import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class likedDto {
  @IsString()
  @IsNotEmpty()
  user_id: string;

  @IsEmail()
  username: string;

  @IsString()
  @IsNotEmpty()
  car_id: string;
}
