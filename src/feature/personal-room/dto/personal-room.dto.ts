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
import { UserTagResDto } from 'src/feature/user-tag/dto/user-tag.dto';
import { UserTag } from 'src/feature/user-tag/entity/userTags.entity';

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
  @Expose({ groups: ['withArea'] })
  @IsOptional()
  personalArea?: PersonalAreaResDto;

  @ApiProperty({ type: [UserImageDto] })
  @Expose({ groups: ['withImages'] })
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
  @Transform(({ value }: { value: UserComment[] }) => {
    if (value) {
      return value.map((userCommentEntity) => {
        return plainToInstance(
          UserCommentResDto,
          instanceToPlain(userCommentEntity),
          {
            excludeExtraneousValues: true,
          },
        );
      });
    }
  })
  userComments?: UserCommentResDto[];

  @ApiProperty({ type: [UserTagResDto] })
  @Expose()
  @IsOptional()
  @IsArray()
  @Transform(({ value }: { value: UserTag[] }) => {
    if (value) {
      return value.map((userTagEntity) => {
        return plainToInstance(UserTagResDto, instanceToPlain(userTagEntity), {
          excludeExtraneousValues: true,
        });
      });
    }
  })
  userTags?: UserTagResDto[];

  @ApiProperty()
  @IsOptional()
  @Expose()
  get totalImages() {
    return this.userImages.length;
  }
}
