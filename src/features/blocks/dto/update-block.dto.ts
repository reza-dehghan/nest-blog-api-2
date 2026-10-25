
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsInt,
    IsString,
    Max,
    Min,
    MinLength,
    ValidateIf,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateBlockDto {
    @ApiPropertyOptional({
        description: 'Updated text content of the block',
        example: 'Updated paragraph content.',
        minLength: 1,
    })
    @ValidateIf((_object, value) => value !== undefined)
    @Transform(({ value }) =>
        typeof value === 'string' ? value.trim() : value,
    )
    @IsString()
    @MinLength(1)
    content?: string;

    @ApiPropertyOptional({
        description: 'Updated position of the block within the post',
        example: 2,
        minimum: 1,
        maximum: 2147483647,
    })
    @ValidateIf((_object, value) => value !== undefined)
    @IsInt()
    @Min(1)
    @Max(2147483647)
    position?: number;
}
