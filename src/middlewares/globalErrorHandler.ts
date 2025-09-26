import { NextFunction, Request, Response } from 'express'
import { HttpError } from 'http-errors'
import { v4 as uuid4 } from 'uuid'
import logger from '../config/logger'
export const globalErrorHandler = (
    err: HttpError,
    req: Request,
    res: Response,
    _next: NextFunction, // underscore makes ESLint ignore it
) => {
    const errorId = uuid4()
    const statusCode = err.status || 500

    const isProduction = process.env.NODE_ENV === 'production'
    const message = isProduction ? 'Internal server error' : err.message
    logger.error(err.message, {
        id: errorId,
        statusCode,
        error: err.stack,
        path: req.path,
        method: req.method,
    })

    res.status(statusCode).json({
        errors: [
            {
                ref: errorId,
                type: err.name,
                msg: message,
                path: req.path,
                method: req.method,
                location: 'server',
                stack: isProduction ? null : err.stack,
            },
        ],
    })
}
