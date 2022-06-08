import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class GuestUserDto {
  @ApiProperty()
  @IsNumber()
  core_user_id: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  guest_email: string;

  @ApiProperty({ type: [Number] })
  hostIds?: number[];
}
