
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  Min,
  IsArray,
} from 'class-validator';

export class CreatePostDto {
  @IsString()
  @Length(1, 200)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  excerpt?: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  @IsInt({ each: true })
  @Min(1, { each: true })
  tagIds?: number[];

  @IsOptional()
  @IsArray()
  @IsInt({each:true})
  @Min(1,{each:true})
 categoryIds?: number[];
}
