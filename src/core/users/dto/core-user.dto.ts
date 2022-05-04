import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class CoreUserDto {
  @ApiProperty()
  @IsNumber()
  userId: number;

  @ApiProperty()
  @IsString()
  email: string;
  //TODO: ADD MORE USER RELATED FIELDS HERE
}

export class CoreUserWithRefreshTokenDto extends CoreUserDto {
  @IsString()
  refreshToken: string;
}
