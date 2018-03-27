import KTM from '../models/KTM'
import Topics from '../models/Topics'
import PublishList from '../models/PublishList'
import SubscriptionList from '../models/SubscriptionList'
import { resolve } from 'url';
import { log } from 'util';


export const getEncryptKey = (topic,deviceId) =>{

    let topic_details 
    return new Promise ( (resolve,reject)=>{
        Topics.getTopicId(topic)
            .then( (id)=>{
                topic_details = id
                //resolve(id.id)
               return PublishList.verifyTopicOrigin(id.id,deviceId)
            })
            .then( (topicId)=>{
                return Topics.getKey(topicId,1)
            } )
            .then(key_details => {
                topic_details.key_id = key_details._id
                resolve({topic:topic_details,key:key_details})
            })
            .catch( (err)=>{
                
                reject(err)
            })
    })
}

export const getDecryptKey = (topic,deviceId) =>{
    return new Promise ((resolve,reject)=>{
        Topics.getTopicId(topic)
            .then((id)=>{
                return SubscriptionList.verifyDeviceSubscription(id,deviceId)
            })
            .then((topicId)=>{
                return Topics.getKey(topicId,2)
            })
            .then(resolve)
            .catch(reject)
    })
}


