import mongoose from 'mongoose'



const Schema  = mongoose.Schema


const statusSchema = new Schema({
    fn_id : {
        type: Schema.Types.ObjectId,
        required:true
    },
    name: String,
    value : Schema.Types.Mixed,
    expected: Schema.Types.Mixed,
    pending : Boolean
})

const loglistSchema = new Schema({
    _id:{
        $type:String
    },
    type:{
        $type:String,
        enum : {
            values: [
                'string',
                'char',
                'int',
                'float'
            ],
            
        },
        required:false
    },
    values: [Schema.Types.Mixed]
},{
    typeKey: '$type'
})


const logSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        required: false
    },
    device :{
        type: Schema.Types.ObjectId,
        required: true
    },
    type_id : {
        type: Schema.Types.ObjectId,
        required: false //true is needded
    },
    activated: {
        type:Boolean,
        required: false //true is needded
    },
    statuses : {
        type: [statusSchema],
        required: false
    },
    log: [loglistSchema]
},{
    _id:false
})

logSchema.methods.findDocumentbyHour = function(datehour){
    return new Promise((resolve, reject) => {
      this.log.findOne({'_id':datehour}).exec()
        .then(res=>resolve(false))
        .catch(reject)
    })
    
}





const SensorLog = mongoose.model('SensorLog',logSchema,'SensorLog')
export default SensorLog
