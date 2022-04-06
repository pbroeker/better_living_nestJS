import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';
import { PersonalRoomDto } from 'src/feature/personal-room/dto/personal-room.dto';

export class PersonalAreaReqDto {
  @ApiProperty()
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
  @IsOptional()
  @IsString()
  id: number;

  @ApiProperty()
  @IsArray()
  personalRooms: PersonalRoomDto[];
}
