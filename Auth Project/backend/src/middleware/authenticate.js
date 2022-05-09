const passport = require("passport");

const JWTStrategy = require("passport-jwt").Strategy;

const User = require("../model/usermodel");

const ExtractJwt = require("passport-jwt").ExtractJwt;

let opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();

opts.secretOrKey = process.env.JWT_SECRET_KEY;
passport.use(
  new JWTStrategy(opts, async function (jwt_payload, done) {
    try {
      console.log(jwt_payload)
      const user = await User.findById(jwt_payload.id);
      if (user) {
        return done(null, user);
      } else {
  
        return done(null, false);
      }
    } catch (err) {
      console.log(err);
    }
  })
);

// module.exports = function(passport){
//   console.log("yes")
//   passport.use(
//     new JWTStrategy(
//       {
//         secretOrKey:"vajcjagcjacj",
//         jwtFromRequest:ExtractJwt.fromAuthHeaderAsBearerToken()

//       },
//       function(jwt_payload,done){
//         console.log(jwt_payload)
//         done(null,false)
//       }
//     )
//   )
// }
