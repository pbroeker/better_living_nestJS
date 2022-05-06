import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { UserImageDto } from 'src/feature/user-image/dto/user-image.dto';

export class UserTagReqDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ type: [Number] })
  @IsOptional()
  @IsArray()
  userImageIds?: number[];
}

export class UserTagResDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ type: [UserImageDto] })
  @IsOptional()
  @IsArray()
  userImages?: UserImageDto[];
}
