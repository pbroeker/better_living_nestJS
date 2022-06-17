import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class LoginUserReqDto {
  @ApiProperty()
  @IsString()
  email: string;

  @ApiProperty()
  @IsString()
  password: string;
}

export class RegisterUserReqDto {
  @ApiProperty()
  @IsString()
  email: string;

  @ApiProperty()
  @IsString()
  password: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  first_name?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  last_name?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  user_name?: string;
}

export class LoginUserResDto {
  @ApiProperty()
  @IsString()
  email: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  first_name?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  last_name?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  user_name?: string;

  @ApiProperty()
  @IsString()
  token: string;
}
