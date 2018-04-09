import User from '../app/models/Users' 
import mongoose from 'mongoose'
import express from 'express'
import {createUser,login,authUser} from '../app/server/User'
import {addNode} from '../app/server/Nodes'
import {getEncryptKey,getDecryptKey} from '../app/server/KTM'
require('dotenv').config();
mongoose.connect(process.env.MONGODB_URL)

const db = mongoose.connection
db.on('error',function(err){
    console.log("DB Conn error");
})
db.once('open',function(){
    console.log("Connnected");
})



const app = express()

app.set("port",8000)

app.get('/',function(req,res){

    res.send("Hello");


})
app.get("/cr",function(req,res){
    
    
    
    createUser({
        username:"abel",
        password:"qwe",
        profile:{
            name:"Abel K S",
            age:22,
            email:"abelk@gmail.com"
        }
    }).then((resp)=>res.send(resp))
    .catch((err)=>res.send(err.message))
    // login("abelk@gmail.com","qwe")
    //     .then((resp)=>{
    //         res.send(resp)
    //     })
    //     .catch( (err)=>{
            
    //         res.send(err.message)
    //     })
})

app.get("/login",function(req,res){
    login("abelk@gmail.com", "qwe")
        .then ((resp)=>{
            res.send(resp)
        }).catch( (err)=>{
            res.send(err.message)
        })
})

app.get("/add",function(req,res){

    authUser("abelk@gmail.com").then((resp)=>{
        return addNode(resp,"Trial1",[{name:"MQTTFX",type:"simulator"},{name:"MQQTfx",type:"simulator"}])
    }).then((respr)=>{
        res.send(respr)
    }).catch( (err)=>{res.send(err.message)})
})

app.get("/sendktm",function(req,res){
    const topic = req.query.topic
    const deviceId = req.query.deviceId 
    getEncryptKey(topic,deviceId).then((resp)=>{
        res.send(resp)
    })
    .catch((err)=>{
        res.send(err.message)
    })
    //res.send(topic)

})
app.get("/getktm",function(req,res){
    const topic = req.query.topic
    const deviceId = req.query.deviceId || '5ab38259437af5970fca52e0'
    getDecryptKey(topic,deviceId).then( (resp)=>{
        res.send(resp)
    })
    .catch((err)=>{
        res.send(err.message)
    })
})

app.listen(app.get("port"))

