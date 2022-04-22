import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { PersonalRoomResDto } from 'src/feature/personal-room/dto/personal-room.dto';

export class PersonalAreaReqDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  title: string;

  @ApiProperty({ type: [Number] })
  personalRoomIds: number[];
}

export class PersonalAreaResDto {
  @ApiProperty()
  @IsString()
  title: string;

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
  @IsNumber()
  id: number;

  @ApiProperty({ type: [PersonalRoomResDto] })
  @IsOptional()
  @IsArray()
  personalRooms?: PersonalRoomResDto[];
}
