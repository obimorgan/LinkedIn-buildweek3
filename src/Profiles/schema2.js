import mongoose from 'mongoose'

const { Schema, model } = mongoose

const profileSchema = new Schema({
    userName: {
        type: String,
        required: true,
        unique: true
    },
    experiences: [{
        role: {
            type: String,
            required: true
        },
        company: {
            type: String,
            required: true
        },
        startDate: {
            type: Date,
            required: true
        },
        endDate: Date,
        description: {
            type: String,
            required: true
        },
        area: {
            type: String,
            required: true
        },
        image: String
    }, { timeStamps: true }]
})

export default model('Profile', profileSchema)