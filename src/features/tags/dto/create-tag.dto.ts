
import {
    IsString,
    Length,
} from 'class-validator';

export class CreateTagDto {
    @IsString()
    @Length(1, 100)
    name!: string;

  
}
