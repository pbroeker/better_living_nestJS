import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UserImageDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  id: number;

  @ApiProperty()
  @IsString()
  src: string;

  @ApiProperty()
  @IsString()
  @IsDateString()
  createdAt: Date;
  @ApiProperty()
  @IsString()
  @IsDateString()
  updatedAt: Date;
}
