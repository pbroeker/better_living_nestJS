import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

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

  @ApiProperty()
  @IsOptional()
  @IsArray()
  personalRoomIds?: number[];
}

export class EditImageRoomDto {
  @ApiProperty()
  @IsArray()
  personalRoomIds: number[];
}

export class PaginatedImagesResDto {
  @ApiProperty({ type: [UserImageDto] })
  @IsArray()
  images: UserImageDto[];

  @ApiProperty()
  @IsNumber()
  total: number;

  @ApiProperty()
  @IsNumber()
  currentPage: number;

  @ApiProperty()
  @IsNumber()
  lastPage: number;

  @ApiProperty()
  @IsNumber()
  nextPage?: number;

  @ApiProperty()
  @IsNumber()
  prevPage?: number;
}
