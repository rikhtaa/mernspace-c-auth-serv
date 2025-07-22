import { checkSchema } from 'express-validator'
export default checkSchema({
    email: {
        errorMessage: 'Email is required!',
        notEmpty: true,
        trim: true,
        isEmail: true,
    },
    firstName: {
        errorMessage: 'firstName is required!',
        notEmpty: true,
    },
    lastName: {
        errorMessage: 'lastName is required!',
        notEmpty: true,
    },
    password: {
        trim: true,
        notEmpty: true,
        errorMessage: 'Password is required!',

        isLength: {
            options: { min: 8 },
            errorMessage: 'Password should be at least 8 chars',
        },
    },
    // role:{
    //     notEmpty:true,
    // }
})

// export default [body('email').notEmpty().withMessage("Email is required!")]
