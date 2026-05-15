import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty({ default: 'Bearer' })
  tokenType: string;

  @ApiProperty({ description: 'Access token lifetime configuration.' })
  accessTokenExpiresIn: string;
}
