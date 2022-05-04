import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { plainToClass } from 'class-transformer';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { CoreUserWithRefreshTokenDto } from 'src/core/users/dto/core-user.dto';
import { SharedUserService } from 'src/shared/shared-user.service';
import { TokenPayloadWithRt } from '../../../types/token';

@Injectable()
export class RtStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh-token',
) {
  constructor(
    configService: ConfigService,
    private sharedUserService: SharedUserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('REFRESH_TOKEN_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: TokenPayloadWithRt) {
    const refreshToken = req.get('authorization').replace('Bearer', '').trim();

    // JWT IS VALID -> RETURN USER
    const userEntity = await this.sharedUserService.findByEmail(
      payload.username,
    );

    if (userEntity) {
      return plainToClass(CoreUserWithRefreshTokenDto, {
        userId: userEntity.id,
        email: userEntity.user_email,
        refreshToken: refreshToken,
      });
    }
  }
}
