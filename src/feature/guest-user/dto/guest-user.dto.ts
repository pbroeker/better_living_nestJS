import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class GuestUserDto {
  @ApiProperty()
  @IsNumber()
  coreUserId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  guestmail: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  hostmail: string;
}
