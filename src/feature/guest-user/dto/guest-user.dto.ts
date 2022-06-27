import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class GuestUserResDto {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty({ type: [Number] })
  @IsOptional()
  guestIds?: number[];

  @ApiProperty({ type: [Number] })
  @IsOptional()
  hostIds?: number[];

  @ApiProperty()
  @IsOptional()
  @IsString()
  userInitials?: string;

  @ApiProperty()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty()
  @IsString()
  first_name: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  last_name?: string;

  @ApiProperty()
  @IsOptional()
  @IsDateString()
  birthday?: string;
}
