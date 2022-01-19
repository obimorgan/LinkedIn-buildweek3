import mongoose from 'mongoose'

const { Schema, model } = mongoose

const jobsSchema = new Schema({
    title: { type: String, required: true },
    company: { type: String, required: true },
    area: { type: String, required: true },
    description: { type: String, required: true },
    salary: { type: Number, required: true },
    type: {
        type: String,
        required: true,
        enum: ['full-time', 'part-time']
    },   
    applicants: [{
        type: Schema.Types.ObjectId,
        ref: 'Profile'
    }]
}, { timestamps: true })

export default model('Job', jobsSchema)