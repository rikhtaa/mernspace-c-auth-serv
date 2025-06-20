import express, { NextFunction, Request, Response } from 'express'
import createHttpError, { HttpError } from 'http-errors'
import logger from './config/logger'

const app = express()

app.get('/', (req, res, next) => {
    const err = createHttpError(401, 'You can not rrrrrr this coute')
    next(err)
    // throw err
    res.send('Welcome to auth service')
})

//global error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
    logger.error(err.message)
    const statusCode = err.statusCode || 500

    res.status(statusCode).json({
        errors: [
            {
                type: err.name,
                msg: err.message,
                path: '',
                location: '',
            },
        ],
    })

    //   return
})

export default app
