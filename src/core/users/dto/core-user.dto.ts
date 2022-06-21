import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CoreUserDto {
  @ApiProperty()
  @IsNumber()
  userId: number;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  first_name: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  last_name?: string;

  @ApiProperty()
  @IsOptional()
  @IsDateString()
  birthday?: string;
}

export class CoreUserWithRefreshTokenDto extends CoreUserDto {
  @IsString()
  refreshToken: string;
}
