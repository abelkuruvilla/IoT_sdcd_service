'use strict';

var _index = require('../app/broker/index');

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

require('dotenv').config();


var ascoltatore = {
    type: 'mongo',
    url: process.env.MONGODB_URL,
    pubsubCollection: process.env.MOSCA_COLLECTION,
    mongo: {}
};
var settings = {
    port: 1883,
    backend: ascoltatore

};
var app = new _index2.default(settings);
app.on('ready', function () {
    console.log('====================================');
    console.log("List on port");
    console.log('====================================');
});