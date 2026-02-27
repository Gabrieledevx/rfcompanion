import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { GenerateRequirements } from '../use-cases/GenerateRequirements';
import { ProjectIdea } from '../../domain/entities/ProjectIdea';

@Processor('requirements')
@Injectable()
export class RequirementsProcessor extends WorkerHost {
    private readonly logger = new Logger(RequirementsProcessor.name);

    constructor(private readonly generateRequirements: GenerateRequirements) {
        super();
    }

    async process(job: Job<any, any, string>): Promise<any> {
        this.logger.log({ message: `Processing background job ${job.id}`, type: job.name });

        try {
            const { ideaData, traceId } = job.data;

            // Reinstanciar la clase ProjectIdea desde el payload de Redis JSON
            const targetDate = ideaData.targetStartDate ? new Date(ideaData.targetStartDate) : undefined;
            const projectIdea = new ProjectIdea(
                ideaData.id,
                ideaData.name,
                ideaData.description,
                targetDate,
                new Date(ideaData.createdAt)
            );

            // Llamar al LLM y RAG pero pasándole un Callback de Progreso
            const result = await this.generateRequirements.execute(projectIdea, traceId, async (progressPct: number) => {
                // Notificar a BullMQ / Redis sobre el porcentaje actual de completitud
                await job.updateProgress(progressPct);
            });

            this.logger.log({ message: `Job ${job.id} finalized successfully`, traceId });
            return result;
        } catch (error: any) {
            this.logger.error({ message: `Job ${job.id} failed`, error: error.message, stack: error.stack });
            throw error;
        }
    }
}
