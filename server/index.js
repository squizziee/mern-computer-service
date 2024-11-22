const express = require("express");
const session = require("express-session");
const passport = require("passport");
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');
require('dotenv').config()

const User = require("./models/User");
const Authenticator = require("./services/auth/Authenticator");
const BaseDbInit = require("./services/data/BaseDbInit");
const DbAccessor = require("./services/data/DbAccessor");

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
        res.status(501);
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
        res.status(501);
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
        res.status(501);
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
        res.send({ message: `Service with id of ${service_id} deleted successfully` });
    } catch (err) {
        console.log(err);
    } finally {
        res.redirect("/api")
    }

});

// Service search
app.get("/api/service", async (req, res) => {
    try {
        const dbAccess = new DbAccessor();
        const data = req.query;
        const result = await dbAccess.getServices({
            service_type_id: data.service_type_id,
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

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});