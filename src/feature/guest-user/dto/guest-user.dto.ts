import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GuestUserDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  guestmail: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  hostmail: string;
}
