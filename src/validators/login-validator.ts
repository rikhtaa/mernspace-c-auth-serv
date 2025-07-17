import { checkSchema } from 'express-validator'
export default checkSchema({
    email: {
        errorMessage: 'Email is required!',
        notEmpty: true,
        trim: true,
        isEmail: {
            errorMessage: 'Email should be a valid email!',
        },
    },
    password: {
        trim: true,
        notEmpty: true,
        errorMessage: 'Password is required!',
    },
})

// export default [body('email').notEmpty().withMessage("Email is required!")]
