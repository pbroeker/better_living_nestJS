import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';
import { PersonalAreaResDto } from 'src/feature/personal-areas/dto/personal-area.dto';

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

  @ApiProperty({ type: PersonalAreaResDto })
  @IsOptional()
  personalArea?: PersonalAreaResDto;
}
