import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDateString, IsOptional, IsString } from 'class-validator';
import { PersonalRoomDto } from 'src/feature/personal-room/dto/personal-room.dto';

export class PersonalAreaReqDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  title: string;

  @ApiProperty()
  @IsArray()
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
  @IsString()
  id: number;

  @ApiProperty()
  @IsArray()
  personalRooms: PersonalRoomDto[];
}
