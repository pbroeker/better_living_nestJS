import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { CoreUser } from '../../../core/users/entity/user.entity';
import { getUserInitials } from '../../../utils/features/helpers';

Exclude();
class GuestUserResDto {
  @ApiProperty()
  @Expose()
  @IsUUID()
  id: number;

  @ApiProperty({ type: [Number] })
  @IsOptional()
  guestIds?: number[];

  @ApiProperty({ type: [Number] })
  @IsOptional()
  hostIds?: number[];

  @ApiProperty()
  @Expose()
  @IsOptional()
  @IsString()
  @Transform(({ obj }: { obj: CoreUser }) => {
    return getUserInitials(obj);
  })
  userInitials?: string;

  @ApiProperty()
  @Expose()
  @IsOptional()
  @IsEmail()
  @Transform(({ obj }: { obj: CoreUser }) => {
    return obj.user_email;
  })
  email?: string;

  @Expose()
  @ApiProperty()
  @IsString()
  first_name: string;

  @ApiProperty()
  @Expose()
  @IsOptional()
  @IsBoolean()
  news_consent?: string;

  @Expose()
  @ApiProperty()
  @IsOptional()
  @IsString()
  last_name?: string;

  @Expose()
  @ApiProperty()
  @IsOptional()
  @IsDateString()
  birthday?: string;
}

export class GuestUserGuestsResDto extends GuestUserResDto {
  @ApiProperty({ type: [Number] })
  @Expose()
  @IsOptional()
  @IsArray()
  @Transform(({ obj }: { obj: CoreUser }) => {
    return obj.hosts.map((guest) => guest.id);
  })
  hostIds?: number[];
}

export class GuestUserHostsResDto extends GuestUserResDto {
  @ApiProperty({ type: [Number] })
  @Expose()
  @IsOptional()
  @IsArray()
  @Transform(({ obj }: { obj: CoreUser }) => {
    return obj.guests.map((guest) => guest.id);
  })
  guestIds?: number[];
}

export class GuestUserFullResDto extends GuestUserResDto {
  @ApiProperty({ type: [Number] })
  @Expose()
  @IsOptional()
  @IsArray()
  @Transform(({ obj }: { obj: CoreUser }) => {
    return obj.guests.map((guest) => guest.id);
  })
  guestIds?: number[];

  @ApiProperty({ type: [Number] })
  @Expose()
  @IsOptional()
  @IsArray()
  @Transform(({ obj }: { obj: CoreUser }) => {
    return obj.hosts.map((guest) => guest.id);
  })
  hostIds?: number[];
}
