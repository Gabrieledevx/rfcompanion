import { Controller, Post, Body, ValidationPipe, Req, Res, HttpStatus, Param, Sse } from '@nestjs/common';
import { GenerateIdeaDto } from './dto/generate-idea.dto';
import { ProjectIdea } from '../../domain/entities/ProjectIdea';
import { Request, Response } from 'express';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Observable } from 'rxjs';
import * as crypto from 'crypto';

@Controller('requirements')
export class RequirementsController {
    constructor(
        @InjectQueue('requirements') private readonly requirementsQueue: Queue
    ) { }

    @Post('/generate')
    async generate(@Body(new ValidationPipe()) dto: GenerateIdeaDto, @Req() req: Request, @Res() res: Response) {
        const targetStartDate = dto.estimatedStartDate ? new Date(dto.estimatedStartDate) : undefined;

        // El traceId lo inyectó nuestro LoggingInterceptor globalmente
        const traceId = req.headers['x-trace-id'] as string || 'no-trace-id';

        const idea = new ProjectIdea(
            crypto.randomUUID(),
            dto.name,
            dto.description,
            targetStartDate
        );

        // Put the Heavy AI Task in the Queue to run asynchronously
        const job = await this.requirementsQueue.add('generate-architecture', {
            ideaData: idea,
            traceId,
        });

        // Free up the HTTP connection in a few milliseconds!
        return res.status(HttpStatus.ACCEPTED).json({
            message: 'Your project analysis is being generated in the background',
            jobId: job.id,
            status: 'processing',
            streamUrl: `http://localhost:3000/requirements/stream/${job.id}`
        });
    }

    @Sse('/stream/:jobId')
    streamJobStatus(@Param('jobId') jobId: string): Observable<any> {
        return new Observable((subscriber) => {
            subscriber.next({ data: { message: 'Connected to Stream. Waiting for Agent completion...', jobId, status: 'processing' } });

            // Pull Redis status every 2.5 seconds
            const interval = setInterval(async () => {
                try {
                    const job = await this.requirementsQueue.getJob(jobId);

                    if (!job) {
                        subscriber.next({ data: { status: 'error', message: 'Job not found in Redis cache' } });
                        subscriber.complete();
                        clearInterval(interval);
                        return;
                    }

                    const isCompleted = await job.isCompleted();
                    const isFailed = await job.isFailed();

                    if (isCompleted) {
                        // Publish Final AI Event
                        subscriber.next({ data: { status: 'completed', result: job.returnvalue } });
                        subscriber.complete(); // Close HTTP Socket
                        clearInterval(interval);
                    } else if (isFailed) {
                        subscriber.next({ data: { status: 'failed', error: job.failedReason } });
                        subscriber.complete();
                        clearInterval(interval);
                    } else {
                        // Send heartbeat
                        subscriber.next({ data: { status: 'processing', progress: job.progress || 0 } });
                    }
                } catch (e) {
                    subscriber.next({ data: { status: 'error', message: 'Error checking job status' } });
                    subscriber.complete();
                    clearInterval(interval);
                }
            }, 2500);

            return () => {
                clearInterval(interval);
            };
        });
    }
}
