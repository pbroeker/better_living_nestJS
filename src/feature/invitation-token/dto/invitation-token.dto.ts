import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class InvitationTokenResDto {
  @ApiProperty()
  @IsString()
  invitationToken: string;

  @ApiProperty()
  inviter: string;
}
