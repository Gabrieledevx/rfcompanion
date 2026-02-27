import { CallHandler, ExecutionContext, Injectable, NestInterceptor, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import * as crypto from 'crypto';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger(LoggingInterceptor.name);

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const ctx = context.switchToHttp();
        const request = ctx.getRequest();
        const response = ctx.getResponse();

        // Generate a unique Correlation / Trace ID for the request
        const traceId = crypto.randomUUID();
        request.headers['x-trace-id'] = traceId;

        // Para evitar el error "Cannot set headers after they are sent to the client"
        // en conexiones asíncronas tipo SSE, seteamos el header de forma segura al inicio.
        if (response && !response.headersSent) {
            try {
                response.header('x-trace-id', traceId);
            } catch (e) {
                // Ignore any header errors if headers are somehow locked
            }
        }

        const { method, url } = request;
        const now = Date.now();

        this.logger.log({
            message: `[START] ${method} ${url}`,
            traceId,
            method,
            url,
            // body: request.body, // In a real app, sanitize sensitive data
        });

        return next
            .handle()
            .pipe(
                tap(() => {
                    const delay = Date.now() - now;

                    this.logger.log({
                        message: `[SUCCESS] ${method} ${url}`,
                        traceId,
                        delayMs: delay,
                        statusCode: response.statusCode,
                    });
                }),
            );
    }
}
