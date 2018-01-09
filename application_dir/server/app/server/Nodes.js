import Users from '../models/Users'

export const addNode = (user,name,devices) =>{
    return new Promise((resolve, reject) => {
      user.addNode(name,devices).then(
        (err,value) =>{
            if(err){

                reject(err)
                
            }
            resolve(value)
        })
        .catch(reject)
    })
    
}