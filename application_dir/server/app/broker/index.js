import mosca from 'mosca'
import {authenticate,authorizePublish,authorizeSubscribe} from './authorizer'


export default (settings) =>{
    const server = new mosca.Server(settings,function(err){
        console.log('====================================');
        console.log("Mosca con error" +err);
        console.log('====================================');
    })

    server.on('ready',function(){
        server.authenticate = authenticate
        server.authorizePublish = authorizePublish
        server.authorizeSubscribe = authorizeSubscribe
        console.log('====================================');
        console.log("READY");
        console.log('====================================');
    })

    server.on('published',function(packet,client){
        if (packet.topic.indexOf('$SYS') === 0) 
            return;
        console.log('====================================');
        console.log("Published data:"+packet.payload.toString()+" topic:"+packet.topic);
        console.log('====================================');
    })

    // server.on('clientConnected',function(client){
    //     console.log('====================================');
    //     console.log("Connected client"+client.id);
    //     console.log('====================================');
    // })
    server.on('subscribed',function(topic,client){
        console.log('====================================');
        console.log("Subscribed topic:"+topic+" client :"+client.id);
        console.log('====================================');
        
    })


    return server
}