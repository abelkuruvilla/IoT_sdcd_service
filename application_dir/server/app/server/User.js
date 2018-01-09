import Users from '../models/Users'

export const createUser = (args) =>{
    
    
    // Users.create(args,function(err,obj){
    //     if (err){
    //         return callback(err)
    //     }
    //     else if(!obj){
    //         let er = new Error();
    //         er.status = 404
    //         return callback(er)
    //     }
    //     return callback(null,obj)

    // })

    return new Promise((resolve, reject) => {
      Users.create(args)
        .then( (obj)=>{
            if(!obj){
                reject (new Error("User couldnot be created"))
            }
            else{
                resolve(obj)
            }
        }).catch (reject)
    })
    
}

export const login = (email,password)=>{

    return new Promise((resolve, reject) => {
       Users.authenticate(email, password)
        .then(resolve)
        .catch(reject)
    })
    
   
    
    
}

