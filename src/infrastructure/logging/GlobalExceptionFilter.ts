import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(GlobalExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();

        // Extract the trace ID injected by our interceptor
        const traceId = request.headers['x-trace-id'] || 'no-trace-id';

        const status =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        const message =
            exception instanceof HttpException
                ? (exception.getResponse() as any)?.message || exception.getResponse()
                : 'Internal server error';

        // Log the error to Kibana via Winston logger
        this.logger.error({
            message: `[ERROR] ${request.method} ${request.url}`,
            traceId,
            path: request.url,
            method: request.method,
            status,
            errorMsg: (exception as any)?.message || message,
            stack: (exception as any)?.stack,
        });

        // Send the generic JSON response back to the client
        response.status(status).json({
            success: false,
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            message,
            traceId, // Expose to client to report issues
        });
    }
}
