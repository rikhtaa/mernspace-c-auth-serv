import 'reflect-metadata'
import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import authRouter from './routes/auth'
import tenantRouter from './routes/tenant'
import userRouter from './routes/user'
import { Config } from './config'
import path from 'path'
import { globalErrorHandler } from './middlewares/globalErrorHandler'
const app = express()
app.use(
    cors({
        origin: Config.FRONTEND_URL,
        credentials: true,
    }),
)
app.use(express.static('public'))
app.use(cookieParser())
app.use(express.json())
app.get('/', (req, res) => {
    res.send('Welcome to auth service')
})

app.use('/auth', authRouter)
app.use('/tenants', tenantRouter)
app.use('/users', userRouter)
app.use(globalErrorHandler)

app.use(
    express.static(path.join(__dirname, '../public'), {
        dotfiles: 'allow',
    }),
)

export default app
