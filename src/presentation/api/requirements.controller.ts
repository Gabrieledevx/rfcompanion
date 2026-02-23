import { Controller, Post, Body, ValidationPipe } from '@nestjs/common';
import { GenerateRequirements } from '../../application/use-cases/GenerateRequirements';
import { GenerateIdeaDto } from './dto/generate-idea.dto';
import { ProjectIdea } from '../../domain/entities/ProjectIdea';

@Controller('requirements')
export class RequirementsController {
    constructor(private readonly generateRequirements: GenerateRequirements) { }

    @Post('/generate')
    async generate(@Body(new ValidationPipe()) dto: GenerateIdeaDto) {
        const idea = new ProjectIdea(
            Math.random().toString(36).substring(7),
            dto.name,
            dto.description
        );
        const result = await this.generateRequirements.execute(idea);
        return result;
    }
}
