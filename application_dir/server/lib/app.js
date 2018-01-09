import User from '../app/models/Users' 
import mongoose from 'mongoose'
import express from 'express'
import {createUser,login} from '../app/server/User'
import {addNode} from '../app/server/Nodes'
require('dotenv').config();
mongoose.connect(process.env.MONGODB_URL,{useMongoClient: true})

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
    
    
    
    // createUser({
    //     username:"abel",
    //     password:"qwe",
    //     profile:{
    //         name:"Abel K S",
    //         age:22,
    //         email:"abelk@gmail.com"
    //     }
    // }).then((resp)=>res.send(resp))
    // .catch((err)=>res.send(err.message))
    login("abelk@gmail.com","qwe")
        .then((resp)=>{
            res.send(resp)
        })
        .catch( (err)=>{
            
            res.send(err.message)
        })
})

app.get("/add",function(req,res){

    login("abelk@gmail.com","qwe").then((result)=>addNode(result,"Test"))
})

app.listen(app.get("port"))

