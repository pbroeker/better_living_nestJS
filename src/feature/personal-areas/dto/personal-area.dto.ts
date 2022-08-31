import { ApiProperty } from '@nestjs/swagger';
import {
  Exclude,
  Expose,
  instanceToPlain,
  plainToInstance,
  Transform,
} from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { getUserInitials } from 'src/utils/features/helpers';
import { PersonalRoomResDto } from '../../../feature/personal-room/dto/personal-room.dto';
import { PersonalArea } from '../entity/personalArea.entity';

export class PersonalAreaReqDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  title: string;

  @ApiProperty({ type: [Number] })
  personalRoomIds: number[];
}

Exclude();
export class PersonalAreaResDto {
  @ApiProperty()
  @Expose()
  @IsString()
  title: string;

  @ApiProperty()
  @Expose()
  @IsOptional()
  @IsUUID()
  id: number;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  isOwner?: boolean;

  @ApiProperty()
  @Expose()
  @IsOptional()
  @IsString()
  @Transform(({ obj }: { obj: PersonalArea }) => {
    return getUserInitials(obj.owner);
  })
  ownerInitials?: string;

  @ApiProperty({ type: [PersonalRoomResDto] })
  @Expose()
  @IsOptional()
  @IsArray()
  @Transform(({ obj }: { obj: PersonalArea }) => {
    return obj.personalRooms.map((personalRoomEntity) => {
      return plainToInstance(
        PersonalRoomResDto,
        instanceToPlain(personalRoomEntity),
        {
          excludeExtraneousValues: true,
        },
      );
    });
  })
  personalRooms?: PersonalRoomResDto[];
}
