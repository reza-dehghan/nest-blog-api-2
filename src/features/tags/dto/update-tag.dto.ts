
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsOptional,
    IsString,
    Length,
} from 'class-validator';

export class UpdateTagDto {
    @ApiPropertyOptional({
        description: 'The updated name of the tag',
        example: 'TypeScript',
        minLength: 1,
        maxLength: 100,
    })
    @IsOptional()
    @IsString()
    @Length(1, 100)
    name?: string;
}
