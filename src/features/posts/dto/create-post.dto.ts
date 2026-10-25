
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
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({
    description: 'Post title',
    example: 'Introduction to NestJS',
    maxLength: 200,
  })
  @IsString()
  @Length(1, 200)
  title!: string;

  @ApiPropertyOptional({
    description: 'Short summary of the post',
    example: 'Learn the fundamentals of NestJS.',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  excerpt?: string;

  @ApiPropertyOptional({
    description: 'Whether the post is published',
    example: false,
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

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
}
