import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import { PersonalAreaResDto } from '../../../feature/personal-areas/dto/personal-area.dto';
import { UserImageDto } from '../../../feature/user-image/dto/user-image.dto';

export class PersonalRoomReqDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  title: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  iconId: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  areaId: number;
}
export class PersonalRoomResDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsNumber()
  iconId: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  id: number;

  @ApiProperty({ type: PersonalAreaResDto })
  @IsOptional()
  personalArea?: PersonalAreaResDto;

  @ApiProperty({ type: [UserImageDto] })
  @IsOptional()
  @IsArray()
  userImages?: UserImageDto[];

  @ApiProperty()
  @IsOptional()
  totalImages?: number;
}
