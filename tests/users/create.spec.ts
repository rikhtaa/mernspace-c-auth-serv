import { DataSource } from 'typeorm'
import { AppDataSource } from '../../src/config/data-source'
import app from '../../src/app'
import request from 'supertest'
import createJWKSMock from 'mock-jwks'
import { Roles } from '../../src/constants'
import { User } from '../../src/entity/User'
import { Tenant } from '../../src/entity/Tenant'
import { CreateTenant } from '../utils'

describe('POST /users', () => {
    let connection: DataSource
    let jwks: ReturnType<typeof createJWKSMock>
    beforeAll(async () => {
        connection = await AppDataSource.initialize()
        jwks = createJWKSMock('http://localhost:5501')
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
        it('should  persist the user in the db', async () => {
            const tenant = await CreateTenant(connection.getRepository(Tenant))
            //Register user
            const userData = {
                firstName: 'Rikhta',
                lastName: 'K',
                email: 'rikhta@gmail.com',
                password: 'secretPassword',
                tenantId: tenant.id,
                role: Roles.MANAGER,
            }
            //Generate token
            const adminToken = jwks.token({
                sub: '1',
                role: Roles.ADMIN,
            })
            //Add token to cookie
            await request(app)
                .post('/users')
                .set('Cookie', [`accessToken=${adminToken};`])
                .send(userData)
            //Assert
            const userRepository = connection.getRepository(User)
            const users = await userRepository.find()

            expect(users).toHaveLength(1)
        })
        it('should create a manager user', async () => {
            //Register user
            const userData = {
                firstName: 'Rikhta',
                lastName: 'K',
                email: 'rikhta@gmail.com',
                password: 'secretPassword',
                role: Roles.MANAGER,
                tenantId: 1,
            }
            //Generate token
            const adminToken = jwks.token({
                sub: '1',
                role: Roles.ADMIN,
            })
            //Add token to cookie
            await request(app)
                .post('/users')
                .set('Cookie', [`accessToken=${adminToken};`])
                .send(userData)
            //Assert
            const userRepository = connection.getRepository(User)
            const users = await userRepository.find()

            expect(users).toHaveLength(1)
            expect(users[0].role).toBe(Roles.MANAGER)
        })
        it.todo('should return 403 if non admin user tries to create a user')
    })
})
