import mongoose from 'mongoose'

const Schema = mongoose.Schema

const TopicsSchema = new Schema({
    key_id : {
        $type: Schema.Types.ObjectId,
        required: false
    },
    topic_name : {
        $type: Schema.Types.String,
        required:true
    },
    type: {
        $type: String,
        enum : {
            values : [
                'int',
                'char',
                'float',
                'string',
                'bool'
            ]
        }
    }
},{
    typeKey: '$type'
})

export default mongoose.model('Topics',TopicsSchema,'Topics')