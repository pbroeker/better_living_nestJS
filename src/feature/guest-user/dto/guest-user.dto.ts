import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNumber, IsOptional, IsString } from 'class-validator';

export class GuestUserResDto {
  @ApiProperty()
  @IsNumber()
  core_user_id: number;

  @ApiProperty({ type: [Number] })
  @IsOptional()
  guestIds?: number[];

  @ApiProperty({ type: [Number] })
  @IsOptional()
  hostIds?: number[];

  @ApiProperty()
  @IsOptional()
  @IsString()
  guestInitals?: string;

  @ApiProperty()
  @IsOptional()
  @IsEmail()
  guest_email?: string;
}
