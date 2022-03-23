import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateRoomReqDto {
  @ApiProperty()
  @IsString()
  title: string;
}

export class CreateRoomResDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  id: number;
}
