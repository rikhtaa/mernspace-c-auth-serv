import request from 'supertest'
import app from '../../src/app'
import { DataSource } from 'typeorm'
import { AppDataSource } from '../../src/config/data-source'
import { truncateTables } from '../utils'
import { User } from '../../src/entity/User'
describe('POST /auth/register', () => {
    describe('Given all fields', () => {
        let connection: DataSource
        //to connect the connection to Db jest hooks can be used
        //beforeAll will run before all tests
        beforeAll(async () => {
            connection = await AppDataSource.initialize()
        })

        beforeEach(async () => {
            await truncateTables(connection)
        })

        afterAll(async () => {
            await connection.destroy()
        })

        it('should return the 201 status code', async () => {
            //AAA
            //Arrange
            const userData = {
                firstName: 'Rikhta',
                lastName: 'K',
                email: 'rikhta@gmail.com',
                password: 'secret',
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
                password: 'secret',
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
                password: 'secret',
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
                password: 'secret',
            }

            await request(app).post('/auth/register').send(userData)

            //Assert
            const userRepository = connection.getRepository(User)
            const users = await userRepository.find()
            expect(users[0].id).toBeDefined()
        })
    })
    describe('Fields are  missing', () => {})
})
