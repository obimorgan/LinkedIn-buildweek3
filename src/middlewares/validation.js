import { checkSchema } from "express-validator"

export const createProfileValidator = checkSchema({
    name: {
        in: ['body'],
        isLength: {
            options: { min: 1 },
            errorMessage: 'You must provide a name'
        }
    },
    surname: {
        in: ['body'],
        isLength: {
            options: { min: 1 },
            errorMessage: 'You must provide a surname'
        }
    },
    email: {
        in: ['body'],
        isEmail: {
            bail: true
        }
    },
    bio: {
        in: ['body'],
        isLength: {
            options: [{ min: 1 }, { max: 100}],
            errorMessage: 'You must provide a bio that is less than 100 characters'
        }
    },
    title: {
        in: ['body'],
        isLength: {
            options: { min: 1 },
            errorMessage: 'You must provide a title'
        }
    },
    area: {
        in: ['body'],
        isLength: {
            options: { min: 1 },
            errorMessage: 'You must provide a title'
        }
    },
    userName: {
        in: ['body'],
        isLength: {
            options: { min: 1 },
            errorMessage: 'You must provide a username'
        }
    },
})

export const createPostValidator = checkSchema({
    text: {
        in: ['body'],
        isLength: {
            options: { min: 1 },
            errorMessage: 'You must provide a name'
        }
    }
})

export const createJobValidator = checkSchema({
    title: {
        in: ['body'],
        isLength: {
            options: { min: 1 },
            errorMessage: 'You must provide a title'
        }
    },
    company: {
        in: ['body'],
        isLength: {
            options: { min: 1 },
            errorMessage: 'You must provide a compnay name'
        }
    },
    area: {
        in: ['body'],
        isLength: {
            options: { min: 1 },
            errorMessage: 'You must provide an area'
        }
    },
    description: {
        in: ['body'],
        isLength: {
            options: { min: 1 },
            errorMessage: 'You must provide a description'
        }
    },
    salary: {
        in: ['body'],
        isInt: true,
        toInt: true,
        errorMessage: 'You must provide a number'
    },
    type: {
        in: ['body'],
        isLength: {
            options: [{ min: 9 }, { max: 9}],
            errorMessage: 'You must provide a job type, either full-time or part-time'
        }
    },
})

export const createCommentValidator = checkSchema({
    text: {
        in: ['body'],
        isLength: {
            options: { min: 1 },
            errorMessage: 'You must provide some text for this comment'
        }
    }
})

export const createExperienceValidator = checkSchema({
    role: {
        in: ['body'],
        isLength: {
            options: { min: 1 },
            errorMessage: 'You must provide a role'
        }
    },
    company: {
        in: ['body'],
        isLength: {
            options: { min: 1 },
            errorMessage: 'You must provide a company name'
        }
    },
    startDate: {
        in: ['body'],
        isDate: true,
        // isLength: {
        //     options: { min: 1 },
        //     errorMessage: 'You must provide some text for this comment'
        // }
    },
    description: {
        in: ['body'],
        isLength: {
            options: { min: 1 },
            errorMessage: 'You must provide a description'
        }
    },
    area: {
        in: ['body'],
        isLength: {
            options: { min: 1 },
            errorMessage: 'You must provide an area'
        }
    },
})