import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsString } from 'class-validator';

export class InvitationTokenResDto {
  @ApiProperty()
  @IsString()
  invitationToken: string;

  @ApiProperty()
  inviter: string;
}

export class PendingInvitationResDto {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsString()
  @IsDateString()
  createdAt: Date;
}
