import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class GuestUserDto {
  @ApiProperty()
  @IsNumber()
  core_user_id: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  guest_email: string;

  @ApiProperty({ type: [Number] })
  hostIds?: number[];
}
