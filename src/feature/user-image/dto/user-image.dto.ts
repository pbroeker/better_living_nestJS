import { ApiProperty } from '@nestjs/swagger';
import {
  Exclude,
  Expose,
  instanceToPlain,
  plainToInstance,
  Transform,
  Type,
} from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { PersonalRoomResDto } from 'src/feature/personal-room/dto/personal-room.dto';
import { UserCommentResDto } from 'src/feature/user-comments/dto/user-comment.dto';
import { UserComment } from 'src/feature/user-comments/entity/userComment.entity';
import { getUserInitials } from 'src/utils/features/helpers';
import { PersonalRoom } from '../../../feature/personal-room/entity/personalRoom.entity';
import { UserTagResDto } from '../../../feature/user-tag/dto/user-tag.dto';
import { ImageFilterOptions } from '../../../types/classes';
import { UserImage } from '../entity/user-image.entity';

Exclude();
export class UserImageDto {
  @ApiProperty()
  @Expose()
  @IsOptional()
  @IsUUID()
  id?: number;

  @ApiProperty()
  @Expose()
  @IsString()
  src: string;

  @ApiProperty()
  @Expose()
  @IsString()
  key: string;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  isOwner?: boolean;

  @ApiProperty()
  @Expose()
  @IsString()
  @Transform(({ obj }: { obj: UserImage }) => {
    if (obj.user) {
      return getUserInitials(obj.user);
    }
  })
  ownerInitials: string;

  @ApiProperty()
  @Expose()
  @IsOptional()
  @IsNumber()
  height?: number;

  @ApiProperty()
  @Expose()
  @IsOptional()
  @IsNumber()
  width?: number;

  @ApiProperty()
  @Expose()
  @IsString()
  @IsDateString()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  @IsString()
  @IsDateString()
  updatedAt: Date;

  @ApiProperty()
  @Expose()
  @IsOptional()
  @IsArray()
  @Transform(({ value }: { value: PersonalRoom[] }) => {
    if (value) {
      return value.map((personalRoomEntity) => {
        return plainToInstance(
          PersonalRoomResDto,
          instanceToPlain(personalRoomEntity),
          {
            excludeExtraneousValues: true,
          },
        );
      });
    }
  })
  personalRooms?: PersonalRoomResDto[];

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
  userTags?: UserTagResDto[];
}

export class ImageFilterQuery {
  @ApiProperty({ type: [Number], required: false })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @Transform(({ value }) => {
    if (typeof value === 'number') {
      return [value];
    } else {
      return value;
    }
  })
  @Type(() => Number)
  tagIds?: number[];

  @ApiProperty({ type: [Number], required: false })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @Transform(({ value }) => {
    if (typeof value === 'number') {
      return [value];
    } else {
      return value;
    }
  })
  @Type(() => Number)
  roomIds?: number[];

  @ApiProperty({ type: [Number], required: false })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @Transform(({ value }) => {
    if (typeof value === 'number') {
      return [value];
    } else {
      return value;
    }
  })
  @Type(() => Number)
  userIds?: number[];
}

export class EditImageDto {
  @ApiProperty({ type: [Number] })
  imageIds: number[];

  @ApiProperty({ type: [Number] })
  personalRoomIds: number[];

  @ApiProperty({ type: [Number] })
  usertagIds: number[];

  @ApiProperty({ type: [String] })
  @IsArray()
  newUsertags: string[];
}

export class PaginatedImagesResDto {
  @ApiProperty({ type: [UserImageDto] })
  @IsArray()
  images: UserImageDto[];

  @ApiProperty()
  @IsNumber()
  total: number;

  @ApiProperty()
  @IsNumber()
  currentPage: number;

  @ApiProperty()
  @IsNumber()
  lastPage: number;

  @ApiProperty()
  @IsNumber()
  nextPage?: number;

  @ApiProperty()
  @IsNumber()
  prevPage?: number;

  @ApiProperty({ type: ImageFilterOptions })
  @IsArray()
  @IsOptional()
  filterOptions: ImageFilterOptions;
}
