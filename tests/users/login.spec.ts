import { DataSource } from 'typeorm'
import { AppDataSource } from '../../src/config/data-source'

describe('GET /auth/self', () => {
    let connection: DataSource
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
        //take the reference from register and write tests
        //for the login
        //e.g
        it.todo('should login the user')
    })
})
