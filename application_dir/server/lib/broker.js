require('dotenv').config();
import server from '../app/broker/index'

const ascoltatore = {
    type:'mongo',
    url:process.env.MONGODB_URL,
    pubsubCollection:process.env.MOSCA_COLLECTION,
    mongo:{}
}
const settings = {
    port: 1883,
    backend : ascoltatore,
    
}
const app = new server(settings)
app
    .on('ready', function () {
       console.log('====================================');
       console.log("List on port");
       console.log('====================================');
    });