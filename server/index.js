const express = require("express");
const session = require("express-session");
const passport = require("passport");
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require('passport-google-oidc').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
require('dotenv').config()

const cors = require('cors')

const { UserModel } = require("./models/User");
const Authenticator = require("./services/auth/Authenticator");
const BaseDbInit = require("./services/data/BaseDbInit");
const DbAccessor = require("./services/data/DbAccessor");
const { UserProfileModel } = require("./models/UserProfile");

const PORT = process.env.BACKEND_PORT;
const MONGODB_URI = process.env.MONGODB_URI;
const SECRET = process.env.SECRET;

const app = express();

mongoose.connect(MONGODB_URI);
const db = mongoose.connection;

app.use(cors({
    origin: "http://localhost:5000", // allow to server to accept request from different origin
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true // allow session cookie from browser to pass through
}))

app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: MONGODB_URI })
}));
// app.use((err, req, res, next) => {
//     console.error(err);
//     res.status(500).send('Internal Server Error');
// });
const strategy = new LocalStrategy(UserModel.authenticate())

passport.use(strategy);
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL:
                'http://localhost:3000/register/google/callback',
        },
        async (request, profile, refreshToken, accessToken, done) => {
            console.log("Data");
            console.log(profile); // accessToken
            const tmp_email = profile.emails[0].value;
            const tmp_id = profile.id;
            const tmp_username = profile.displayName;
            try {
                let user = await UserModel.findOne({ google_id: profile.id });
                if (!user) {
                    profile = new UserProfileModel({
                        first_name: 'Anonymous',
                        last_name: 'Client',
                        email: 'default@example.com',
                        address: 'None',
                        phone_number: '+375330000000',
                        passport_serial: "None",
                        created_at: new Date()
                    });
                    await profile.validate();
                    await profile.save();

                    UserModel.register(
                        new UserModel({
                            google_id: tmp_id,
                            email: tmp_email,
                            username: tmp_username,
                            user_profile: profile
                        }),
                        "00000000",
                        async function (err, msg) {
                            if (err) {
                                console.log(err);
                                console.log("Thrown, deleting trash");
                                console.log(profile);
                                await UserProfileModel.deleteOne(profile);
                            } else {

                            }
                        }
                    );
                }
                done(null, user);
            } catch (err) {
                done(err, null);
            }
        }
    )
);

passport.serializeUser(UserModel.serializeUser());
passport.deserializeUser(UserModel.deserializeUser());
app.use(passport.initialize());
app.use(passport.session());

const auth = new Authenticator(app);

require('./routes/service_type_routes')(app);

app.post('/register', auth.registerDefault);

app.get('/register/google', passport.authenticate("google", {
    scope: ['email', 'profile'],
    successRedirect: process.env.CLIENT_HOME,
    failureRedirect: process.env.CLIENT_REGISTER,
}));

app.get('/register/google/callback', passport.authenticate("google", {
    scope: ['email', 'profile'],
    failureRedirect: process.env.CLIENT_LOGIN,
    failureMessage: true,
    successRedirect: process.env.CLIENT_HOME
}), (req, res) => {
    console.log("huh")
});

app.post('/login', passport.authenticate('local', {
    successRedirect: '/api',
    failureRedirect: '/api'
}), (err, req, res, next) => {
    if (err) {
        res.status(500);
    }
    res.status(200);
    res.send("Success");
});

app.get('/login/status', (req, res) => {
    if (req.isAuthenticated()) {
        res.json({ authenticated: true, user: req.user });
    } else {
        res.json({ authenticated: false });
    }
});

app.post('/logout', (req, res, next) => {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.status(200);
        res.send("Success");
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
    res.json({ message: "Hello from server!", user: req.user });
});

app.post("/api/init_database", async (req, res, next) => {
    if (!req.user) {
        res.status(401);
        res.send("Not authenticated");
        return;
    }
    try {
        let tmp = new BaseDbInit();
        //await tmp.initializeServiceTypes();
        //await tmp.initializeDeviceTypes();
        await tmp.initializeServices();
        res.status(200);
    } catch (err) {
        res.status(500);
        res.send('An error occured while processing request');
        console.log(err);
        return;
    } finally {
        res.redirect("/api")
    }
});

// Service CRUD
app.get("/api/service/:id", async (req, res) => {
    try {
        const dbAccess = new DbAccessor();
        const service_id = req.params['id'];
        const result = await dbAccess.getServiceById(service_id);

        if (!result) {
            res.status(404);
            res.send(`No service with id ${service_id} found`)
        }
        else {
            res.status(200);
            res.send(result.toJSON());
        }
    } catch (err) {
        res.status(500);
        res.send('An error occured while processing request');
        console.log(err);
    }

});

app.post("/api/service", async (req, res, next) => {
    if (!req.user) {
        res.status(401);
        res.send("Not authenticated");
        return;
    }
    try {
        const dbAccess = new DbAccessor();
        const data = req.body;
        await dbAccess.addService({
            service_type_id: data.service_type_id,
            name: data.name,
            description: data.description,
            base_price: data.base_price,
            device_types: data.device_types,
        })
        res.status(200);
    } catch (err) {
        res.status(500);
        res.send('An error occured while processing request');
        console.log(err);
    } finally {
        res.redirect("/api")
    }
});

app.put("/api/service/:id", async (req, res, next) => {
    if (!req.user) {
        res.status(401);
        res.send("Not authenticated");
        return;
    }
    try {
        const dbAccess = new DbAccessor();
        const service_id = req.params['id']
        const data = req.body;

        console.log(service_id);
        console.log(data)

        await dbAccess.updateServiceById({
            service_id: service_id,
            service_type_id: data.service_type_id,
            name: data.name,
            description: data.description,
            base_price: data.base_price,
            device_types: data.device_types,
        })
        res.status(200);
    } catch (err) {
        res.status(500);
        res.send('An error occured while processing request');
        console.log(err);
    } finally {
        res.redirect("/api")
    }
});

app.delete("/api/service/:id", async (req, res, next) => {
    if (!req.user) {
        res.status(401);
        res.send("Not authenticated");
        return;
    }
    try {
        const dbAccess = new DbAccessor();
        const service_id = req.params['id'];
        await dbAccess.deleteServiceById(service_id);
        res.status(200);
        res.send({ message: `Service with id of ${service_id} deleted successfully` });
    } catch (err) {

    }

});

// Service search
app.get("/api/service", async (req, res) => {
    try {
        const dbAccess = new DbAccessor();
        const data = req.query;
        const result = await dbAccess.getServices({
            service_type_id_list: data.service_type_list,
            min_price: data.min_price,
            max_price: data.max_price,
            device_types: data.device_types,
            text_query: data.text_query,
            sort_by: data.sort,
        });
        res.status(200);
        res.send(result);
    } catch (err) {
        res.status(500);
        res.send('An error occured while processing request');
        console.log(err);
    }

});

app.get("/api/devicetype", async (req, res) => {
    try {
        const dbAccess = new DbAccessor();
        const result = await dbAccess.getDeviceTypes();
        res.status(200);
        res.send(result);
    } catch (err) {
        res.status(500);
        res.send('An error occured while processing request');
        console.log(err);
    }

});

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});