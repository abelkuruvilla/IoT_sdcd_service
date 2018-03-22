import mongoose from 'mongoose'

const Schema = mongoose.Schema

const KTMSchema = new Schema({
    keyT:{
        type:String,
        required:true
    },
    val :{
        type: Date,
        required : true
    },
    atb : {
        type:String
    }
})

const KTM= mongoose.model('KTM',KTMSchema,'KTM')
export default KTM