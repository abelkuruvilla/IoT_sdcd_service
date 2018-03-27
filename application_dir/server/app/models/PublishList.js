import mongoose from 'mongoose'
import { resolve } from 'url';

const Schema = mongoose.Schema

const pubListSchema = new Schema({
    device: {
        type:Schema.Types.ObjectId,
        required:true
    },
    topic :{
        type:Schema.Types.ObjectId,
        required:true

    }
},{
    _id:false
})


const publishSchema = new Schema({
    user : {
        type:Schema.Types.ObjectId,
        required: true
    },
    publist : [pubListSchema]

},{
    _id:false
})

publishSchema.statics.verifyTopicOrigin = function(topicId,deviceId){

    return new Promise((resolve,reject)=>{
        this.findOne({'publist.topic':topicId})
            .exec().then( (user)=>{
                if (!user) {

                    reject(new Error("User not found"))
                }
                user.publist.forEach(element => {
                    if(element.topic == topicId){
                        if(element.device == deviceId)
                            resolve(topicId)
                        else
                            reject(new Error("Invalid Origin Device"))
                    }
                });
                
            } )
    })
}

const PublishList = mongoose.model('PublishList',publishSchema,'PublishList')
export default PublishList


