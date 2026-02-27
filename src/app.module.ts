import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { RequirementsController } from './presentation/api/requirements.controller';
import { GenerateRequirements } from './application/use-cases/GenerateRequirements';
import { GoogleGeminiService } from './infrastructure/llm/GoogleGeminiService';
import { PGVectorStoreWrapper } from './infrastructure/db/PGVectorStore';
import { RequirementsProcessor } from './application/jobs/requirements.processor';
import { PGProjectRepository } from './infrastructure/db/PGProjectRepository';
import { config } from './infrastructure/config/env';

@Module({
    imports: [
        BullModule.forRoot({
            connection: {
                host: config.redisHost,
                port: config.redisPort,
            },
        }),
        BullModule.registerQueue({
            name: 'requirements',
        }),
    ],
    controllers: [RequirementsController],
    providers: [
        {
            provide: 'ILLMService',
            useClass: GoogleGeminiService,
        },
        {
            provide: 'IVectorStore',
            useClass: PGVectorStoreWrapper,
        },
        {
            provide: 'IProjectRepository',
            useClass: PGProjectRepository,
        },
        {
            provide: GenerateRequirements,
            useFactory: (llmService: GoogleGeminiService, vectorStore: PGVectorStoreWrapper, projectRepo: PGProjectRepository) => {
                return new GenerateRequirements(llmService, vectorStore, projectRepo);
            },
            inject: ['ILLMService', 'IVectorStore', 'IProjectRepository']
        },
        RequirementsProcessor
    ],
})
export class AppModule { }
