import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class CoreUserDto {
  @ApiProperty()
  @IsNumber()
  userId: number;

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
  @IsOptional()
  @IsDateString()
  birthday?: string;
}

export class CoreUserWithRefreshTokenDto extends CoreUserDto {
  @IsString()
  refreshToken: string;
}
