import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { PersonalRoom } from '../../../feature/personal-room/entity/personalRoom.entity';
import { UserTagResDto } from '../../../feature/user-tag/dto/user-tag.dto';
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
  personalRooms?: Partial<PersonalRoom>[];

  @ApiProperty({ type: [UserTagResDto] })
  @IsOptional()
  @IsArray()
  userTags?: UserTagResDto[];
}

export class EditImageDto {
  @ApiProperty({ type: [Number] })
  personalRoomIds: number[];

  @ApiProperty({ type: [Number] })
  usertagIds: number[];

  @ApiProperty()
  @IsArray()
  newUsertags: string[];
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
