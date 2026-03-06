import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        const status =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        const message =
            exception instanceof HttpException
                ? exception.getResponse()
                : exception.message || 'Internal server error';

        const errorResponse = {
            success: false,
            statusCode: status,
            message: typeof message === 'string' ? message : (message as any).message || message,
            timestamp: new Date().toISOString(),
            path: ctx.getRequest().url,
        };

        // Log the error for internal tracking (optional)
        if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
            console.error('Unhandled Exception:', exception);
        }

        response.status(status).json(errorResponse);
    }
}
