
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  Min,
} from 'class-validator';
import {
  ApiPropertyOptional,
} from '@nestjs/swagger';

export class UpdatePostDto {
  @ApiPropertyOptional({
    description: 'Updated post title',
    example: 'Introduction to NestJS',
    minLength: 1,
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @Length(1, 200)
  title?: string;

  @ApiPropertyOptional({
    description: 'Updated post slug',
    example: 'introduction-to-nestjs',
    minLength: 1,
    maxLength: 250,
  })
  @IsOptional()
  @IsString()
  @Length(1, 250)
  slug?: string;

  @ApiPropertyOptional({
    description: 'Updated post summary; can be null',
    example: 'An introduction to NestJS.',
    maxLength: 500,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  excerpt?: string | null;

  @ApiPropertyOptional({
    description: 'Whether the post is published',
    example: true,
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({
    description: 'IDs of categories assigned to the post',
    example: [1, 3],
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  categoryIds?: number[];

  @ApiPropertyOptional({
    description: 'IDs of tags assigned to the post',
    example: [1, 2],
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  tagIds?: number[];
}
