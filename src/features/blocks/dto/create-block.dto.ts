
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
    @ApiPropertyOptional({
        description: 'Type of the block. Defaults to TEXT.',
        enum: BlockType,
        example: BlockType.TEXT,
        default: BlockType.TEXT,
    })
    @IsOptional()
    @IsEnum(BlockType)
    type: BlockType = BlockType.TEXT;

    @ApiProperty({
        description:
            'Text content of the block. Required when type is TEXT.',
        example: 'This is a paragraph in the article.',
        minLength: 1,
        required: false,
    })
    @ValidateIf((object) => object.type === BlockType.TEXT)
    @Transform(({ value }) =>
        typeof value === 'string' ? value.trim() : value,
    )
    @IsString()
    @MinLength(1)
    content?: string;

    @ApiPropertyOptional({
        description:
            'ID of the media resource. Required when type is IMAGE.',
        example: 12,
        minimum: 1,
        maximum: 2147483647,
    })
    @ValidateIf((object) => object.type === BlockType.IMAGE)
    @IsInt()
    @Min(1)
    @Max(2147483647)
    mediaId?: number;

    @ApiProperty({
        description: 'Position of the block within the post',
        example: 1,
        minimum: 1,
        maximum: 2147483647,
    })
    @IsInt()
    @Min(1)
    @Max(2147483647)
    position!: number;
}
