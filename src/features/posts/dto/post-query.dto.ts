
import {
  IsOptional,
  IsString,
  MaxLength,
  IsInt,
  Min,
  IsIn,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import {
  ApiPropertyOptional,
} from '@nestjs/swagger';

export class PostQueryDto {
  @ApiPropertyOptional({
    description: 'Search published posts by title or excerpt',
    example: 'NestJS',
    maxLength: 100,
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MaxLength(100)
  search?: string;



  
  @ApiPropertyOptional({
    description: 'Filter posts by category ID',
    example: 1,
    type: Number,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  categoryId?: number;




  @ApiPropertyOptional({
    description: 'Filter posts by tag ID',
    example: 2,
    type: Number,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  tagId?: number;



  @ApiPropertyOptional({
    description: 'Field used to sort published posts',
    enum: ['title', 'createdAt', 'updatedAt'],
    example: 'createdAt',
  })
  @IsOptional()
  @IsIn(['title', 'createdAt', 'updatedAt'])
  sortBy?: 'title' | 'createdAt' | 'updatedAt';



  @ApiPropertyOptional({
    description: 'Sort direction',
    enum: ['ASC', 'DESC'],
    example: 'DESC',
  })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC';
}
