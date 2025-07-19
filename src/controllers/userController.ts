import { NextFunction, Response } from 'express'
import { UserService } from '../services/UserService'
import { CreatUserRequest } from '../types'
import { Roles } from '../constants'

export class UserController {
    constructor(private userService: UserService) {}
    async create(req: CreatUserRequest, res: Response, next: NextFunction) {
        const { firstName, lastName, email, password } = req.body
        try {
            const user = await this.userService.create({
                firstName,
                lastName,
                email,
                password,
                role: Roles.CUSTOMER,
            })
            res.status(201).json({ id: user.id })
        } catch (error) {
            next(error)
        }
    }
}
