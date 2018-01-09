import passport from 'passport'
import {ExtractJwt,JwtStrategy} from 'passport-jwt'

var jwtOptions = {}
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeader()
jwtOptions.secretOrKey = process.env.JWT_KEY

const Strategy = new JwtStrategy(jwtOptions,function(jwt_payload,next){
    console.log('payload received', jwt_payload);
    // usually this would be a database call:
    var user = users[_.findIndex(users, {id: jwt_payload.id})];
    if (user) {
        next(null, user);
    } else {
        next(null, false);
    }
}) 