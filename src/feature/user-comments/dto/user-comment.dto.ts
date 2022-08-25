import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UserCommentReqDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsOptional()
  @IsNumber()
  roomId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsOptional()
  @IsNumber()
  imageId: number;
}

export class UserCommentResDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsDate()
  createdAt: Date;

  @ApiProperty()
  @IsNotEmpty()
  @IsDate()
  updatedAt: Date;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  roomId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  imageId: number;
}
