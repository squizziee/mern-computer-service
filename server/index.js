const express = require("express");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');
const GoogleStrategy = require('passport-google-oidc');
require('dotenv').config()

const User = require("./models/User");
const Authenticator = require("./services/auth/Authenticator");

const PORT = process.env.PORT;
const MONGODB_URI = process.env.MONGODB_URI;
const SECRET = process.env.SECRET;

const app = express();

mongoose.connect(MONGODB_URI);
const db = mongoose.connection;

app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret: SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: MONGODB_URI })
}));

const auth = new Authenticator(app);

// app.post('/register', function (req, res) {
//     User.register(
//         new User({
//             username: req.body.email,
//             email: req.body.email,
//             first_name: req.body.first_name,
//             last_name: req.body.last_name,
//             phone_number: req.body.phone_number,
//             address: req.body.address,
//             passport_serial: req.body.passport_serial
//         }), req.body.password, function (err, msg) {
//             if (err) {
//                 res.send(err);
//             } else {
//                 res.send({ message: "Successful" });
//             }
//         }
//     )
// })

app.post('/register', auth.registerDefault);

app.post('/register/google', passport.authenticate("google", {
    scope: ['email', 'profile']
}));

app.post('/login/google', passport.authenticate("google", {
    scope: ['email', 'profile']
}));

app.post('/login', passport.authenticate('local', {
    failureRedirect: '/login-failure',
    successRedirect: '/login-success'
}), (err, req, res, next) => {
    if (err) next(err);
});

app.post('/logout', (req, res, next) => {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect('/api');
    });
});

app.get('/login-failure', (req, res, next) => {
    console.log(req.session);
    res.send('Login Attempt Failed.');
});

app.get('/login-success', (req, res, next) => {
    console.log(req.session);
    res.send('Login Attempt was successful.');
});

app.get('/profile', function (req, res) {
    console.log(req.session)
    if (req.isAuthenticated()) {
        res.json({ message: 'You made it to the secured profie' })
    } else {
        res.json({ message: 'You are not authenticated' })
    }
})

app.get("/api", (req, res) => {
    res.json({ message: "Hello from server!" });
});

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});
