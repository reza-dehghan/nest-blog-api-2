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
    @ValidateIf((_object, value) => value !== undefined)
    @Transform(({ value }) =>
        typeof value === 'string' ? value.trim() : value,
    )
    @IsString()
    @MinLength(1)
    content?: string;

    @ValidateIf((_object, value) => value !== undefined)
    @IsInt()
    @Min(1)
    @Max(2147483647)
    position?: number;
}
