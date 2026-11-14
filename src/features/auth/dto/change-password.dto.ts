
import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Current account password',
    example: 'CurrentPass123!',
  })
  @IsString()
  currentPassword: string;

  @ApiProperty({
    description: 'New account password',
    example: 'NewStrongPass123!',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  newPassword: string;
}
