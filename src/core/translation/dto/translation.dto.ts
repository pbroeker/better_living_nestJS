import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class TranslationDto {
  @ApiProperty()
  @IsString()
  language: 'en' | 'de';
}
