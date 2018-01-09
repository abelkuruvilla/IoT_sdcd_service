import mongoose from 'mongoose'

const Schema = mongoose.Schema

const propertieSchema = new Schema({
    name:{
        $type:String,
        required:true
    },
    type: {
        $type:String,
        enum : {
            values: [
                'text',
                'number',
                'range',
                'password',
                'time',
                'date',
                'datetime',
                'url'
            ],
            message: ' `{VALUE}` is not a valid category'
        },
        required : true
    },
    range : {
        min : Number,
        max: Number,
        step :Number
    },
    default_value : Schema.Types.Mixed,
    accepted_values: [{
        key : String,
        value : Schema.Types.ObjectId
    }]

}, {
    typeKey: '$type',
    timestamps: true
})

const propFuncSchema = new Schema({
    _id : {
        type: Schema.Types.ObjectId
    },
    expected : Schema.Types.Mixed,
    pending : Boolean
},{autoIndex:false,_id:false})

const functionSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    properties: [propFuncSchema]
})

const deviceTypeSchema = new Schema({
    name:{
        type: String,
        required: true
    },
    description:String,
    categories : {
        type: [String]
    },
    properties : [ propertieSchema ],
    functions : [ functionSchema]

})


export default mongoose.model('DeviceTypes',deviceTypeSchema,'DeviceTypes')