import { IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';

export class GenerateIdeaDto {
    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsString()
    @IsNotEmpty()
    description!: string;

    @IsOptional()
    @IsDateString()
    estimatedStartDate?: string;
}
