import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SharedUserService } from '../../shared/shared-user.service';
import { plainToClass } from 'class-transformer';
import { CoreUserDto } from '../users/dto/core-user.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private sharedUserService: SharedUserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('SECRET'),
    });
  }

  async validate(payload: {
    username: string;
    sub: number;
    iat: number;
    exp: number;
  }) {
    // JWT IS VALID -> RETURN USER
    const userEntity = await this.sharedUserService.findByEmail(
      payload.username,
    );
    return plainToClass(CoreUserDto, {
      userId: userEntity.id,
      userEmail: userEntity.user_email,
    });
  }
}
