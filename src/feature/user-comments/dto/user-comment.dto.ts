import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Transform } from 'class-transformer';
import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { getUserInitials } from '../../../utils/features/helpers';
import { UserComment } from '../entity/userComment.entity';

export class UserCommentReqDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsOptional()
  @IsNumber()
  roomId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsOptional()
  @IsNumber()
  imageId: number;
}

@Exclude()
export class UserCommentResDto {
  @ApiProperty()
  @Expose()
  @IsOptional()
  @IsUUID()
  id?: number;

  @ApiProperty()
  @Expose()
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty()
  @Expose()
  @IsNotEmpty()
  @IsDate()
  createdAt: Date;

  @ApiProperty()
  @Expose({ groups: ['allComments'] })
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ obj }: { obj: UserComment }) => {
    return obj.personalRoom.id;
  })
  roomId: number;

  @ApiProperty()
  @Expose({ groups: ['allComments'] })
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ obj }: { obj: UserComment }) => {
    return obj.userImage.id;
  })
  imageId: number;

  @ApiProperty()
  @Expose()
  @IsNotEmpty()
  @IsString()
  @Transform(({ obj }: { obj: UserComment }) => {
    return `${obj.user.first_name} ${
      obj.user.last_name ? obj.user.last_name : ''
    }`;
  })
  ownerName: string;

  @ApiProperty()
  @Expose()
  @IsNotEmpty()
  @IsString()
  @Transform(({ obj }: { obj: UserComment }) => {
    return getUserInitials(obj.user);
  })
  ownerInitials: string;
}
