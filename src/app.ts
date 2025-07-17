import 'reflect-metadata'
import express, { NextFunction, Request, Response } from 'express'
import cookieParser from 'cookie-parser'
import { HttpError } from 'http-errors'
import logger from './config/logger'
import authRouter from './routes/auth'
const app = express()

app.use(express.static('public'))
app.use(cookieParser())
app.use(express.json())
app.get('/', (req, res) => {
    // throw err
    res.send('Welcome to auth service')
})

app.use('/auth', authRouter)

//global error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
    logger.error(err.message)
    const statusCode = err.statusCode || err.status || 500

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
