

export const authenticate = (client,username,password,callback) =>{
    callback(null,true)
}

export const authorizePublish = (client,topic,payload,callback) =>{
callback(null, true)
}

export const authorizeSubscribe = (client,topic,callback)=>{
callback(null, true)    
}