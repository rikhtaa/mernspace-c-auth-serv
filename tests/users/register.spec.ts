import request from 'supertest'
import app from '../../src/app'
import { DataSource } from 'typeorm'
import { AppDataSource } from '../../src/config/data-source'
import { User } from '../../src/entity/User'
import { Roles } from '../../src/constants'
import { isJwt } from '../utils'
import { RefreshToken } from '../../src/entity/RefreshToken'
describe('POST /auth/register', () => {
    let connection: DataSource
    //to connect the connection to Db jest hooks can be used
    //beforeAll will run before all tests
    beforeAll(async () => {
        connection = await AppDataSource.initialize()
    })

    beforeEach(async () => {
        await connection.dropDatabase()
        await connection.synchronize()
    })

    afterAll(async () => {
        await connection.destroy()
    })
    describe('Given all fields', () => {
        it('should return the 201 status code', async () => {
            //AAA
            //Arrange
            const userData = {
                firstName: 'Rikhta',
                lastName: 'K',
                email: 'rikhta@gmail.com',
                password: 'secretPassword',
                role: 'manager',
            }
            //Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData)

            //Assert
            expect(response.statusCode).toBe(201)
        })
        it('should return valid json response', async () => {
            //AAA
            //Arrange
            const userData = {
                firstName: 'Rikhta',
                lastName: 'K',
                email: 'rikhta@gmail.com',
                password: 'secretPassword',
            }
            //Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData)
            //Assert
            expect(
                (response.headers as Record<string, string>)['content-type'],
            ).toEqual(expect.stringContaining('json'))
        })
        it('should persist the user in the database', async () => {
            //Arrange
            const userData = {
                firstName: 'Rikhta',
                lastName: 'K',
                email: 'rikhta@gmail.com',
                password: 'secretPassword',
                role: 'manager',
            }

            //Act
            await request(app).post('/auth/register').send(userData)

            //Assert
            const userRepository = connection.getRepository(User)
            const users = await userRepository.find()
            expect(users).toHaveLength(1)
            expect(users[0].firstName).toBe(userData.firstName)
            expect(users[0].lastName).toBe(userData.lastName)
            expect(users[0].email).toBe(userData.email)
        })
        it('should return the id of the created user', async () => {
            const userData = {
                id: 124,
                firstName: 'Rikhta',
                lastName: 'K',
                email: 'rikhta@gmail.com',
                password: 'secretPassword',
                role: 'manager',
            }

            const response = await request(app)
                .post('/auth/register')
                .send(userData)

            //Assert
            expect(response.body).toHaveProperty('id')
            const userRepository = connection.getRepository(User)
            const users = await userRepository.find()
            expect((response.body as Record<string, string>).id).toBe(
                users[0].id,
            )
        })
        it('should assign a customer role', async () => {
            //Arrange
            const userData = {
                firstName: 'Rikhta',
                lastName: 'K',
                email: 'rikhta@gmail.com',
                password: 'secretPassword',
                role: Roles.CUSTOMER,
            }

            //Act
            await request(app).post('/auth/register').send(userData)

            //Assert
            const userRepository = connection.getRepository(User)
            const users = await userRepository.find()
            expect(users[0]).toHaveProperty('role')
            expect(users[0].role).toBe(Roles.CUSTOMER)
        })
        it('should store the hashed password in the database', async () => {
            //Arrange
            const userData = {
                firstName: 'Rikhta',
                lastName: 'K',
                email: 'rikhta@gmail.com',
                password: 'secretPassword',
                role: Roles.CUSTOMER,
            }

            //Act
            await request(app).post('/auth/register').send(userData)

            //Assert
            const userRepository = connection.getRepository(User)
            const users = await userRepository.find({ select: ['password'] })
            expect(users[0].password).not.toBe(userData.password)
            expect(users[0].password).toHaveLength(60)
            expect(users[0].password).toMatch(/^\$2[a|b]\$\d+\$/)
        })
        it('should return 400 status code if email is already exists', async () => {
            //Arrange
            const userData = {
                firstName: 'Rikhta',
                lastName: 'K',
                email: 'rikhta@gmail.com',
                password: 'secretPassword',
            }

            const userRepository = connection.getRepository(User)
            await userRepository.save({ ...userData, role: Roles.CUSTOMER })

            //Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData)
            const users = await userRepository.find()

            //Assert
            expect(response.statusCode).toBe(400)
            expect(users).toHaveLength(1)
        })
        it('should return a accessToken and refreshToken inside a cookie', async () => {
            //Arrange
            const userData = {
                firstName: 'rekhta',
                lastName: 'Menahil',
                email: 'rekhta@gmail.com',
                password: 'secretPassword',
                role: Roles.CUSTOMER,
            }

            //Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData)

            interface Headers {
                ['set-cookie']: string[]
            }

            //Assert
            let accessToken = null
            let refreshToken = null
            const cookies =
                (response.headers as unknown as Headers)['set-cookie'] || []

            cookies.forEach((cookie) => {
                if (cookie.startsWith('accessToken='))
                    accessToken = cookie.split(';')[0].split('=')[1]
                if (cookie.startsWith('refreshToken='))
                    refreshToken = cookie.split(';')[0].split('=')[1]
            })
            expect(accessToken).not.toBeNull()
            expect(refreshToken).not.toBeNull()
            expect(isJwt(accessToken)).toBeTruthy()
            expect(isJwt(refreshToken)).toBeTruthy()
        })
        it('should store the refresh token in the database', async () => {
            //Arrange
            const userData = {
                firstName: 'rekhta',
                lastName: 'Menahil',
                email: 'rekhta@gmail.com',
                password: 'secretPassword',
                role: Roles.CUSTOMER,
            }

            //Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData)

            //Assert
            const refreshTokenRepo = connection.getRepository(RefreshToken)
            // const refreshTokens = await refreshTokenRepo.find()

            const tokens = await refreshTokenRepo
                .createQueryBuilder('refreshToken')
                .where('refreshToken.userId = :userId', {
                    userId: (response.body as Record<string, string>).id,
                })
                .getMany()
            expect(tokens).toHaveLength(1)
        })
    })
    describe('Fields are  missing', () => {
        it('should return 400 status code if email field is missing', async () => {
            //Arrange
            const userData = {
                firstName: 'Rikhta',
                lastName: 'K',
                email: '',
                password: 'secretPassword',
            }

            //Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData)

            //Assert
            expect(response.statusCode).toBe(400)
            const userRepository = connection.getRepository(User)
            const users = await userRepository.find()
            expect(users).toHaveLength(0)
        })
        it('should return 400 status code if firstname is missing', async () => {
            //Arrange
            const userData = {
                firstName: '',
                lastName: 'K',
                email: 'rekhta@gmail.com',
                password: 'secretPassword',
            }

            //Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData)

            //Assert
            expect(response.statusCode).toBe(400)
            const userRepository = connection.getRepository(User)
            const users = await userRepository.find()
            expect(users).toHaveLength(0)
        })
        it('should return 400 status code if lastName is missing', async () => {
            //Arrange
            const userData = {
                firstName: 'rekhta',
                lastName: '',
                email: 'rekhta@gmail.com',
                password: 'secretPassword',
            }

            //Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData)

            //Assert
            expect(response.statusCode).toBe(400)
            const userRepository = connection.getRepository(User)
            const users = await userRepository.find()
            expect(users).toHaveLength(0)
        })
        it('should return 400 status code if Password is missing', async () => {
            //Arrange
            const userData = {
                firstName: 'rekhta',
                lastName: 'Menahil',
                email: 'rekhta@gmail.com',
                password: '',
            }

            //Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData)

            //Assert
            expect(response.statusCode).toBe(400)
            const userRepository = connection.getRepository(User)
            const users = await userRepository.find()
            expect(users).toHaveLength(0)
        })
    })
    describe('Fields are not in proper format', () => {
        it('should return 400 status code if email is not valid', async () => {
            //Arrange
            const userData = {
                firstName: 'Rikhta',
                lastName: 'K',
                email: 'rikhta@',
                password: 'secretPassword',
            }

            //Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData)

            //Assert
            expect(response.statusCode).toBe(400)
            const userRepository = connection.getRepository(User)
            const users = await userRepository.find()
            expect(users).toHaveLength(0)
        })
        it('should return 400 status code if password length is less than 8 chars', async () => {
            //Arrange
            const userData = {
                firstName: 'Rikhta',
                lastName: 'K',
                email: 'rikhta@',
                password: 'secretPassword',
            }

            //Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData)

            //Assert
            expect(response.statusCode).toBe(400)
            const userRepository = connection.getRepository(User)
            const users = await userRepository.find()
            expect(users).toHaveLength(0)
        })
        it('should trim the email field', async () => {
            //Arrange
            const userData = {
                firstName: 'Rikhta',
                lastName: 'K',
                email: ' rikhta@gmail.com ',
                password: 'secretPassword',
                role: Roles.MANAGER,
            }

            //Act
            await request(app).post('/auth/register').send(userData)

            //Arrange
            const userRepository = connection.getRepository(User)
            const users = await userRepository.find()
            const user = users[0]
            expect(user.email).toBe('rikhta@gmail.com')
        })
        it('shoud return an array of error messages if email is missing', async () => {
            // Arrange
            const userData = {
                firstName: 'Rakesh',
                lastName: 'K',
                email: '',
                password: 'password',
            }
            // Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData)

            // Assert
            expect(response.body).toHaveProperty('errors')
            expect(
                (response.body as Record<string, string>).errors.length,
            ).toBeGreaterThan(0)
        })
    })
})
