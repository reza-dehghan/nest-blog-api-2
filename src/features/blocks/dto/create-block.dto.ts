
import {
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    Max,
    Min,
    MinLength,
    ValidateIf,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { BlockType } from '../entities/block.entity.js';

export class CreateBlockDto {
    @IsOptional()
    @IsEnum(BlockType)
    type: BlockType = BlockType.TEXT;

    @ValidateIf((object) => object.type === BlockType.TEXT)
    @Transform(({ value }) =>
        typeof value === 'string' ? value.trim() : value,
    )
    @IsString()
    @MinLength(1)
    content?: string;

    @ValidateIf((object) => object.type === BlockType.IMAGE)
    @IsInt()
    @Min(1)
    @Max(2147483647)
    mediaId?: number;

    @IsInt()
    @Min(1)
    @Max(2147483647)
    position!: number;
}
