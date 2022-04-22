import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { PersonalAreaResDto } from 'src/feature/personal-areas/dto/personal-area.dto';
import { UserImage } from 'src/feature/user-image/entity/user-image.entity';

export class PersonalRoomReqDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  title: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  iconId: number;
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

  @ApiProperty({ type: [UserImage] })
  @IsOptional()
  @IsArray()
  userImages?: UserImage[];
}
