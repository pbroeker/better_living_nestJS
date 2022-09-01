import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { UserCommentResDto } from '../../../feature/user-comments/dto/user-comment.dto';
import { PersonalAreaResDto } from '../../../feature/personal-areas/dto/personal-area.dto';
import { UserImageDto } from '../../../feature/user-image/dto/user-image.dto';
import {
  Exclude,
  Expose,
  instanceToPlain,
  plainToInstance,
  Transform,
} from 'class-transformer';
import { UserImage } from 'src/feature/user-image/entity/user-image.entity';
import { UserComment } from 'src/feature/user-comments/entity/userComment.entity';

export class PersonalRoomReqDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  title: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  iconId: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  areaId: number;
}

Exclude();
export class PersonalRoomResDto {
  @ApiProperty()
  @Expose()
  @IsString()
  title: string;

  @ApiProperty()
  @Expose()
  @IsNumber()
  iconId: number;

  @ApiProperty()
  @Expose()
  @IsOptional()
  @IsUUID()
  id: number;

  @ApiProperty({ type: PersonalAreaResDto })
  @Expose()
  @IsOptional()
  personalArea?: PersonalAreaResDto;

  @ApiProperty({ type: [UserImageDto] })
  @Expose()
  @IsOptional()
  @IsArray()
  @Transform(({ value }: { value: UserImage }) => {
    return plainToInstance(UserImageDto, instanceToPlain(value), {
      excludeExtraneousValues: true,
    });
  })
  userImages?: UserImageDto[];

  @ApiProperty({ type: [UserCommentResDto] })
  @Expose()
  @IsOptional()
  @IsArray()
  @Transform(({ value }: { value: UserComment }) => {
    return plainToInstance(UserCommentResDto, instanceToPlain(value), {
      excludeExtraneousValues: true,
    });
  })
  userComments?: UserCommentResDto[];

  @ApiProperty()
  @Expose()
  get totalImages() {
    return this.userImages.length;
  }
}
