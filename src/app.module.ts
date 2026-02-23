import { Module } from '@nestjs/common';
import { RequirementsController } from './presentation/api/requirements.controller';
import { GenerateRequirements } from './application/use-cases/GenerateRequirements';
import { GoogleGeminiService } from './infrastructure/llm/GoogleGeminiService';
import { PGVectorStoreWrapper } from './infrastructure/db/PGVectorStore';

@Module({
    imports: [],
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
            provide: GenerateRequirements,
            useFactory: (llmService: GoogleGeminiService, vectorStore: PGVectorStoreWrapper) => {
                return new GenerateRequirements(llmService, vectorStore);
            },
            inject: ['ILLMService', 'IVectorStore']
        }
    ],
})
export class AppModule { }
