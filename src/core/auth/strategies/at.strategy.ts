import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { plainToClass } from 'class-transformer';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { CoreUserDto } from '../../../core/users/dto/core-user.dto';
import { SharedUserService } from '../../../shared/shared-user.service';
import { TokenPayload } from '../../../types/token';

@Injectable()
export class AtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService,
    private sharedUserService: SharedUserService,
  ) {
    super({
      ignoreExpiration: true,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('ACCESS_TOKEN_SECRET'),
    });
  }

  async validate(payload: TokenPayload) {
    // Check if access_token expired
    if (payload.exp < Date.now() / 1000) {
      throw new ForbiddenException({
        title: 'login.error.expired_access_token.title',
        text: 'login.error.expired_access_token.title',
      });
    }

    // JWT IS VALID -> RETURN USER
    const userEntity = await this.sharedUserService.findByEmail(
      payload.username,
    );

    if (userEntity) {
      return plainToClass(CoreUserDto, {
        userId: userEntity.id,
        email: userEntity.user_email,
      });
    }
  }
}
