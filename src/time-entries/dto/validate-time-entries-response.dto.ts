import { ApiProperty } from '@nestjs/swagger';

export class ValidateTimeEntriesResponseDto {
  @ApiProperty({ example: 2 })
  validated: number;
}
