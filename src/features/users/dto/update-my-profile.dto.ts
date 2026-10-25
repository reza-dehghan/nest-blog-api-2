import {
  ApiPropertyOptional,
} from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateMyProfileDto {
  @ApiPropertyOptional({
    description: 'The first name of the user',
    example: 'Reza',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @ApiPropertyOptional({
    description: 'The last name of the user',
    example: 'Dehghan',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @ApiPropertyOptional({
    description: 'The email address of the user',
    example: 'reza@example.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'The display name of the user',
    example: 'Reza D.',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  displayName?: string;

  @ApiPropertyOptional({
    description: 'A short biography of the user',
    example: 'Backend developer interested in NestJS and PostgreSQL.',
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({
    description: 'The phone number of the user',
    example: '+491234567890',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    description: 'The personal website URL of the user',
    example: 'https://example.com',
  })
  @IsOptional()
  @IsString()
  website?: string;
}
