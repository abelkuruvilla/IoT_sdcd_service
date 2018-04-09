import mongoose from 'mongoose'

const Schema = mongoose.Schema


const subListSchema = new Schema({
    node : Schema.Types.ObjectId,
    topics: [Schema.Types.ObjectId]
})

const subscriptionSchema = new Schema({
    user :{
        type:Schema.Types.ObjectId,
        required:true
    },
    sublist : [subListSchema]
})

subscriptionSchema.statics.verifyDeviceSubscription = function(topicId, deviceId){
    return new Promise((resolve,reject)=>{
        // Edited device id finding
        this.findOne({'sublist.topics':topicId},{'sublist':{$elemMatch:{'node':deviceId } }})
            .exec().then((user)=>{
                if(!user)
                    reject(new Error("Node not authorized1"))
                user.sublist.forEach(node => {
                    if(node.node == deviceId){
                        node.topics.forEach(topic=>{
                            
                            if(topic == topicId.id)
                                resolve(topicId)
                        })
                        reject(new Error("Node not authorized2"))
                    }
                });
                reject(new Error("Node not authorized3"))
            })
    })
}

const SubscriptionList = mongoose.model('SubscriptionList',subscriptionSchema,'SubscriptionList')
export default SubscriptionList