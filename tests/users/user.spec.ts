import { DataSource } from 'typeorm'
import { AppDataSource } from '../../src/config/data-source'
import app from '../../src/app'
import request from 'supertest'
import createJWKSMock from 'mock-jwks'
import { Roles } from '../../src/constants'
import { User } from '../../src/entity/User'

describe('POST /auth/Login', () => {
    let connection: DataSource
    let jwks: ReturnType<typeof createJWKSMock>
    beforeAll(async () => {
        jwks = createJWKSMock('http://localhost:5501')
        connection = await AppDataSource.initialize()
    })

    beforeEach(async () => {
        jwks.start()
        await connection.dropDatabase()
        await connection.synchronize()
    })

    afterEach(() => {
        jwks.stop()
    })
    afterAll(async () => {
        await connection.destroy()
    })

    describe('Given all fields', () => {
        it('should return the 200 status code', async () => {
            const accessToken = jwks.token({ sub: '1', role: Roles.CUSTOMER })
            const response = await request(app)
                .get('/auth/self')
                .set('Cookie', [`accessToken=${accessToken}`])
                .send()
            expect(response.statusCode).toBe(200)
        })
        it('should return the user data', async () => {
            //Register user
            const userData = {
                firstName: 'Rikhta',
                lastName: 'K',
                email: 'rikhta@gmail.com',
                password: 'secretPassword',
            }
            const userRepository = connection.getRepository(User)
            const data = await userRepository.save({
                ...userData,
                role: Roles.CUSTOMER,
            })
            //Generate token
            const accessToken = jwks.token({
                sub: String(data.id),
                role: Roles.CUSTOMER,
            })
            //Add token to cookie
            const response = await request(app)
                .get('/auth/self')
                .set('Cookie', [`accessToken=${accessToken};`])
                .send()
            //Assert
            //Check if user id matches with registered user
            expect((response.body as Record<string, string>).id).toBe(data.id)
        })
    })
})
