'use strict';

var _Users = require('../app/models/Users');

var _Users2 = _interopRequireDefault(_Users);

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _User = require('../app/server/User');

var _Nodes = require('../app/server/Nodes');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

require('dotenv').config();
_mongoose2.default.connect(process.env.MONGODB_URL, { useMongoClient: true });

var db = _mongoose2.default.connection;
db.on('error', function (err) {
    console.log("DB Conn error");
});
db.once('open', function () {
    console.log("Connnected");
});

var app = (0, _express2.default)();

app.set("port", 8000);

app.get('/', function (req, res) {

    res.send("Hello");
});
app.get("/cr", function (req, res) {

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
    (0, _User.login)("abelk@gmail.com", "qwe").then(function (resp) {
        res.send(resp);
    }).catch(function (err) {

        res.send(err.message);
    });
});

app.get("/add", function (req, res) {

    (0, _User.login)("abelk@gmail.com", "qwe").then(function (result) {
        return (0, _Nodes.addNode)(result, "Test");
    });
});

app.listen(app.get("port"));