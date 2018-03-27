import mongoose, { Promise } from 'mongoose'
import bcrypt from 'bcrypt'
import { log } from 'util';


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

KTMSchema.methods.renewKey = function(topicName){
    return new Promise((resolve,reject)=>{
        const now = new Date()
        const val = now.setTime(+now+(2 * 24*60*60*1000))
        bcrypt.hash(topicName+now.toString(),10)
            .then((keyT)=>{
                    
                    this.keyT = keyT
                    this.val = val
                    return this.save()
            })
            .then(resolve)
            .catch(reject)

    })
}
KTMSchema.statics.getKeyDetails = function(keyId){
    return new Promise( (resolve,reject)=>{
        this.findOne({'_id':keyId}).exec()
        .then(resolve)
        .catch(reject)
    })

}

KTMSchema.statics.generateKey = function(topicName){
    return new Promise( (resolve,reject)=>{
        
        const now = new Date()
        const val = now.setTime(+now+(2 * 24*60*60*1000))
        bcrypt.hash(topicName+now.toString(),10)
            .then((keyT)=>{
                    
                    let ktm = new this({keyT:keyT,val:val})
                    return ktm.save()
            })
            .then(resolve)
            .catch(reject)

    })
}

const KTM= mongoose.model('KTM',KTMSchema,'KTM')
export default KTM