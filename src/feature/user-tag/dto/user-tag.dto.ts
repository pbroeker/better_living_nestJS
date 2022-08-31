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
import { PersonalRoomResDto } from 'src/feature/personal-room/dto/personal-room.dto';
import { PersonalRoom } from 'src/feature/personal-room/entity/personalRoom.entity';
import { UserImage } from 'src/feature/user-image/entity/user-image.entity';

export class UserTagReqDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ type: [Number] })
  @IsOptional()
  @IsArray()
  userImageIds?: number[];

  @ApiProperty({ type: [Number] })
  @IsOptional()
  @IsArray()
  personalRoomIds?: number[];
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
  @Expose({ groups: ['getCompleteTag'] })
  @IsArray()
  @Transform(({ value }: { value: UserImage[] }) => {
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

  @ApiProperty({ type: [PersonalRoomResDto] })
  @IsOptional()
  @Expose({ groups: ['getCompleteTag'] })
  @IsArray()
  @Transform(({ value }: { value: PersonalRoom[] }) => {
    return value.map((personalRoom) => {
      return {
        id: personalRoom.id,
        title: personalRoom.title,
        iconId: personalRoom.iconId,
      };
    });
  })
  personalRooms?: PersonalRoomResDto[];
}
