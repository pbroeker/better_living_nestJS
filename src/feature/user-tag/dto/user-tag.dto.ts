import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { UserImageDto } from '../../user-image/dto/user-image.dto';
import { Exclude, Expose, Transform } from 'class-transformer';

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

@Exclude()
export class UserTagResDto implements Readonly<UserTagResDto> {
  @ApiProperty()
  @IsUUID()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ type: [UserImageDto] })
  @IsOptional()
  @Expose()
  @IsArray()
  @Transform(({ value }) => {
    return value.map((userImage) => {
      return {
        id: userImage.id,
        src: userImage.src,
        key: userImage.key,
        createdAt: userImage.createdAt,
        updatedAt: userImage.updatedAt,
      };
    });
  })
  userImages?: UserImageDto[];
}
