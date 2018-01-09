import mongoose from 'mongoose'

const Schema = mongoose.Schema


const subscriptionSchema = new Schema({
    node : Schema.Types.ObjectId,
    topics: [Schema.Types.ObjectId]
})