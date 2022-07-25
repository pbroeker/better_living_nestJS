import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { PersonalRoomResDto } from '../../../feature/personal-room/dto/personal-room.dto';

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
  @IsOptional()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  isOwner?: boolean;

  @ApiProperty()
  @IsOptional()
  @IsString()
  ownerInitials?: string;

  @ApiProperty({ type: [PersonalRoomResDto] })
  @IsOptional()
  @IsArray()
  personalRooms?: PersonalRoomResDto[];
}
