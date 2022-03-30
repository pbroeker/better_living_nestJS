import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(UnauthorizedException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    // CATCHES THE GENERIC INVALID TOKEN ERROR FROM JWT STRATEGY
    response.status(status).json({
      title: 'login.error.invalid_token.title',
      text: 'login.error.invalid_token.message',
    });
  }
}
