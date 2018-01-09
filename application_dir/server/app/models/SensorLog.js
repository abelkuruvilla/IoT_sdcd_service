import mongoose from 'mongoose'



const Schema  = mongoose.Schema


const statusSchema = new Schema({
    prop_id : {
        type: Schema.Types.ObjectId,
        required:true
    },
    name: String,
    value : Schema.Types.Mixed,
    expected: Schema.Types.Mixed,
    pending : Boolean
})

const logSchema = new Schema({
    type_id : {
        type: Schema.Types.ObjectId,
        required: true
    },
    activated: Boolean,
    statuses : [statusSchema],
    values: []
})


