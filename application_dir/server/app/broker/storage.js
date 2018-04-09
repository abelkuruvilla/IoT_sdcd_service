import KTM from '../models/KTM'
import SensorLog from '../models/SensorLog'
import { resolve } from 'url';
import atob from 'atob'
var Crypto = require('cryptojs');
Crypto = Crypto.Crypto;

const Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=Base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/[^A-Za-z0-9+/=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=Base64._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/rn/g,"n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}}

const getDecryptKey  = (keyId)=>{
    return new Promise((resolve,reject)=>{
        KTM.findOne({'_id':keyId}).exec()
            .then((result)=>{
                if(!result)
                    reject(new Error("Invlaid key"))
                resolve(result.keyT)
            }).catch(reject)
    })
    
}

const decryptData = (data)=>{
    return new Promise((resolve,reject)=>{
        getDecryptKey(data.keyId)
            .then( (key)=>{
                 let enc = data.data

               
                //  const newKey = Crypto.SHA256(key).slice(0,32)
                 

                //  const MODE = new Crypto.mode.CBC(Crypto.pad.ZeroPadding);
                //  const IV = 'This is an IV456'
                //  const options = {iv: Crypto.charenc.UTF8.stringToBytes(IV), asBytes: true, mode: MODE}


                // const output_bytes = Crypto.util.hexToBytes(enc);
                
                // const output_plaintext_bytes = Crypto.AES.decrypt(output_bytes, newKey, options);
                // // console.log(output_plaintext_bytes)
                // const output_plaintext = Crypto.charenc.UTF8.bytesToString(output_plaintext_bytes);
                //  console.log(output_plaintext)
                 // result: 
                // resolve(output_plaintext)
                resolve(enc)
                                    
            })
            .catch(reject)
        

    })
    
    
}
export const addToDatabase = (packet)=>{
    //{ topic: 'home/garden/fountain',
//   payload: <Buffer 7b 61 73 64 61 73 3a 61 73 64 61 73 64 7d>,
//   messageId: 'gR931H_',
//   qos: 0,
//   retain: false }
//packet.payload.toString() will contain the message

    return new Promise((resolve, reject) => {
    let data
      decryptData(JSON.parse(packet.payload.toString()))
        .then((decrypt_data)=>{
            data = decrypt_data
            return SensorLog.findOne({'device':decrypt_data.deviceId}).exec()
            
        })
        .then( (device)=>{
            const datehour = data.time.replace(/ /g,'T').slice(0,13)
            const min = data.time.slice(14,16)
            const sec = data.time.slice(17,19)
            device.findOneAndUpdate({
                
            })

        })
        .catch(reject)
    })
    

    
}
