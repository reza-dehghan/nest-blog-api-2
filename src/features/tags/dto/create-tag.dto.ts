
import { ApiProperty } from '@nestjs/swagger';
import {
    IsString,
    Length,
} from 'class-validator';

export class CreateTagDto {
    @ApiProperty({
        description: 'The name of the tag',
        example: 'NestJS',
        minLength: 1,
        maxLength: 100,
    })
    @IsString()
    @Length(1, 100)
    name!: string;
}
