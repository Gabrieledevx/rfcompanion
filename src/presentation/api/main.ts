import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { ElasticsearchTransport } from 'winston-elasticsearch';
import { config } from '../../infrastructure/config/env';
import { LoggingInterceptor } from '../../infrastructure/logging/LoggingInterceptor';
import { GlobalExceptionFilter } from '../../infrastructure/logging/GlobalExceptionFilter';

async function bootstrap() {
    // Configure Winston to send logs to Console and Elasticsearch
    const loggerInstance = winston.createLogger({
        level: 'info',
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
        ),
        transports: [
            new winston.transports.Console({
                format: winston.format.combine(
                    winston.format.colorize(),
                    winston.format.simple()
                ),
            }),
            new ElasticsearchTransport({
                level: 'info',
                clientOpts: { node: config.elkUrl },
                indexPrefix: 'rf-agent-logs',
            })
        ],
    });

    const app = await NestFactory.create(AppModule, {
        logger: WinstonModule.createLogger({
            instance: loggerInstance,
        }),
    });

    // Clean Architecture & Monitoring: Register Global Middleware
    app.useGlobalInterceptors(new LoggingInterceptor());
    app.useGlobalFilters(new GlobalExceptionFilter());

    app.enableCors();
    await app.listen(3000);
    loggerInstance.info('Application is running on: http://localhost:3000');
}
bootstrap();
