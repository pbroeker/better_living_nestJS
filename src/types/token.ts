export interface TokenPayload {
  username: string;
  sub: number;
  iat?: number;
  exp?: number;
}

export interface TokenPayloadWithRt extends TokenPayload {
  currentHashedRefreshToken: string;
}
