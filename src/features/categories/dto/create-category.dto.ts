import {
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @Length(1, 100)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string | null;
}