import mongoose from 'mongoose'

const Schema = mongoose.Schema


export const publishSchema = new Schema({
    topic_name : String,
    device : Schema.Types.ObjectId,
    type: Schema.Types.ObjectId
})
