
// const passport = require("passport");
// const LocalStrategy = require("passport-local").Strategy;
// const GoogleStrategy = require('passport-google-oidc');
// const FacebookStrategy = require('passport-facebook').Strategy;
// const { UserModel } = require("../../models/User");
// const { UserProfileModel } = require("../../models/UserProfile");
// require('dotenv').config()

// class Authenticator {
//     constructor(app) {
//         // const strategy = new LocalStrategy(User.authenticate())

//         // passport.use(strategy);
//         // passport.use(
//         //     new GoogleStrategy(
//         //         {
//         //             clientID: process.env.GOOGLE_CLIENT_ID,
//         //             clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//         //             callbackURL:
//         //                 process.env.CLIENT_HOME,
//         //         },
//         //         async (accessToken, refreshToken, profile, done) => {
//         //             console.log("here");
//         //             try {
//         //                 let user = await User.findOne({ google_id: profile.id });
//         //                 console.log(user);
//         //                 if (!user) {
//         //                     user = new User({
//         //                         googleId: profile.id,
//         //                         email: profile.emails[0].value,
//         //                         username: profile.displayName,
//         //                         password: "00000000"
//         //                     });
//         //                     await user.save();
//         //                 }
//         //                 done(null, user);
//         //             } catch (err) {
//         //                 done(err, null);
//         //             }
//         //         }
//         //     )
//         // );

//         // passport.use(
//         //     new FacebookStrategy(
//         //         {
//         //             clientID: process.env.GOOGLE_CLIENT_ID,
//         //             clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//         //             callbackURL:
//         //                 '/profile',
//         //         },
//         //         async (accessToken, refreshToken, profile, done) => {
//         //             try {
//         //                 let user = await User.findOne({ google_id: profile.id });

//         //                 if (!user) {
//         //                     user = new User({
//         //                         googleId: profile.id,
//         //                         email: profile.emails[0].value,
//         //                         username: profile.displayName,
//         //                     });
//         //                     await user.save();
//         //                 }

//         //                 done(null, user);
//         //             } catch (err) {
//         //                 done(err, null);
//         //             }
//         //         }
//         //     )
//         // );

//         // passport.serializeUser(User.serializeUser());
//         // passport.deserializeUser(User.deserializeUser());
//         // app.use(passport.initialize());
//         // app.use(passport.session());
//     }

//     async registerDefault(req, res) {
//         let now = new Date();
//         let profile;
//         try {
//             profile = new UserProfileModel({
//                 first_name: 'Anonymous',
//                 last_name: 'Client',
//                 email: 'default@example.com',
//                 address: 'None',
//                 phone_number: '+375330000000',
//                 passport_serial: "None",
//                 created_at: now,
//                 last_updated_at: now
//             });
//             await profile.validate();
//             await profile.save();

//             UserModel.register(
//                 new UserModel({
//                     username: req.body.username,
//                     email: req.body.email,
//                     user_profile: profile
//                 }),
//                 req.body.password,
//                 async function (err, msg) {
//                     if (err) {
//                         console.log("Thrown, deleting trash");
//                         console.log(profile);
//                         await UserProfileModel.deleteOne(profile);
//                         res.send(err);
//                     } else {
//                         res.send({ message: "Account created successfully" });
//                     }
//                 }
//             )
//         } catch (err) {
//             res.send(err);
//         }
//     }

//     registerWithGoogleOauth2(scope) {
//         if (scope) {
//             passport.authenticate("google", {
//                 scope: scope
//             });
//         }
//         else {
//             passport.authenticate("google", {
//                 scope: ['email', 'profile']
//             });
//         }
//     }

//     loginDefault(req, res) {
//         passport.authenticate('local', {
//             failureRedirect: '/login-failure',
//             successRedirect: '/login-success'
//         });
//     }

//     loginGoogle() {
//         if (scope) {
//             passport.authenticate("google", {
//                 scope: scope
//             });
//         }
//         else {
//             passport.authenticate("google", {
//                 scope: ['email', 'profile']
//             });
//         }
//     }
// }

// export default Authenticator;