export interface RefreshTokenPayload {
  sub: string;
  tokenId: string;
  type: 'refresh';
}
