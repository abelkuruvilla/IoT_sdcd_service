import mongoose from 'mongoose'
require('dotenv').config();
import server from '../app/broker/index'
mongoose.connect(process.env.MONGODB_URL)

const db = mongoose.connection
db.on('error', function (err) {
    console.log("DB Conn error");
})
db.once('open', function () {
    console.log("Connnected");
})

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