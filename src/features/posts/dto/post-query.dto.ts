import { IsOptional, IsString, MaxLength,IsInt,Min,IsIn } from 'class-validator';
import { Transform,Type } from 'class-transformer';

export class PostQueryDto {
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MaxLength(100)
  search?: string;

  @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    categoryId?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    tagId?: number;

    @IsOptional()
    @IsIn(['title', 'createdAt', 'updatedAt'])
    sortBy?: 'title' | 'createdAt' | 'updatedAt';

    @IsOptional()
    @IsIn(['ASC', 'DESC'])
    sortOrder?: 'ASC' | 'DESC';
}