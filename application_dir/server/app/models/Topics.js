import mongoose, { Promise } from 'mongoose'
import { resolve } from 'url';
import KTM from './KTM'

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

TopicsSchema.statics.getTopicId = function(topicName){

    return new Promise ( (resolve,reject)=>{
        this.findOne({'topic_name':topicName})
            .exec().then((topic)=>{
                if(!topic)
                    reject(new Error("No Topic"))
                resolve (topic)
            })
    })
}


//Type 1 Encrypt, 2 decrypt
TopicsSchema.statics.getKey = function(topicId,type){

    return new Promise( (resolve,reject)=>{

        this.findOne({'_id':topicId})
            .exec().
            then((topic)=>{
                if(!topic)
                    reject(new Error("No Topic"))
                if(topic.key_id){
                    return KTM.getKeyDetails(topic.key_id)
                        .then((key)=>{
                            if(type==2)
                                resolve(key)
                            else{
                                const now = new Date()
                                if(key.val<=now){

                                    return key.renewKey(topic)
                                }
                                resolve (key)
                            }
                            
                        })
                }
                else{
                    if(type==1)
                        return topic.addKey()
                }
            })
            .then(resolve)
            .catch(reject)
    })
}
TopicsSchema.methods.addKey = function(){

    return new Promise( (resolve,reject)=>{
        KTM.generateKey(this.topic_name)
            .then( (key)=>{
                this.key_id = key.id
                this.save()
                resolve(key)
            })
            .catch(reject)
    })
}


const Topics =  mongoose.model('Topics',TopicsSchema,'Topics')
export default Topics