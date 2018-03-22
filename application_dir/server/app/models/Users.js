import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import Promise from 'promise'
import jwt from 'jsonwebtoken'


const Schema = mongoose.Schema
mongoose.Promise = Promise
const deviceSchema = new Schema({
    name: String,
    type: {
        $type: Schema.Types.ObjectId,
        ref : 'DeviceTypes',
        required:false
    },
    secretKey : String,
    activation_code: String
},{
    typeKey: '$type'
}) 

const nodeSchema = new Schema({
    name: { type: String, required: true},
    devices : [deviceSchema]
})

nodeSchema.methods.addDevice = function (name,type) {
    return new Promise((resolve, reject) => {
        this.devices.push({
            name:name,
            type: type
        })
        this.save().then(resolve)
            .catch(reject)
    });
}

const userSchema = new Schema({
    username:  { type:String, required:true, unique:true,trim:true},
    password: { type:String, required:true},
    profile : {
        name: String,
        age: Number,
        email:{type:String,required:true,unique:true,trim:true}
    },
    nodes : [nodeSchema]


},{timestamps:true})

userSchema.pre('save',function(next){
    let user = this
    bcrypt.hash(user.password,10,function(err,hash){
        if (err)
            return next(err)
        user.password = hash
        next()
    })
})

userSchema.statics.login = function(email,password){
    
    return new Promise((resolve, reject) => {
         this.findOne({'profile.email':email})
        .exec().then( (user)=>{
            
                if (!user) {
                    reject(  new Error("User not found") )
                }
                if (bcrypt.compareSync(password, user.password)) {
                    const payload = {
                        id:user._id,
                        uname:user.username
                    }
                    const token = jwt.sign(payload,process.env.JWT_KEY)
                    resolve (user)
                }
                else 
                    reject(new Error("Invalid Password") )
            
            
            
        }).catch(reject)
    })
    
   
}

userSchema.statics.authenticate = function(email){
    return new Promise((resolve,reject)=>{
        this.findOne({'profile.email': email}).exec()
        .then( (user)=>{
            if (!user) {
                reject(new Error("User not found"))
            }
            resolve(user)
        })
    })
  




}

userSchema.methods.addNode = function(name,devices){
    return new Promise((resolve, reject) => {
       
      this.nodes.push({name:name})
      this.save()
        .then( (saved) =>{
            
            if(!devices || devices ==null){
                resolve(saved)
            }
            devices.forEach((element)=>{
                saved.addDevice(element.name,element.type).catch(reject)
            })
            //resolve(saved)

        }).catch(reject)
    })
    
    
        
}

userSchema.methods.findDevice = function(deviceId){

}





const Users = mongoose.model('Users', userSchema,'Users')
export default Users

