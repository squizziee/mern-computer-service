import express, { urlencoded } from "express";
import dotenv from 'dotenv'
import authMiddleware from "./authMiddleware.js";
import FirestoreAccessor from "./services/data/FirestoreAccessor.js";
import cors from 'cors';

import deviceTypeRoutes from './routes/deviceTypeRoutes.js'

dotenv.config();

const app = express();


app.use(cors({
    origin: "http://localhost:5000", // allow to server to accept request from different origin
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true // allow session cookie from browser to pass through
}))


app.use("/", authMiddleware);

app.use(urlencoded({ extended: true }));

app.use('/api/devicetype', deviceTypeRoutes)

const db = new FirestoreAccessor();

app.post('/auth/new', async (req, res) => {
    let id = req.body.user_id;
    let profile;
    try {
        profile = await db.createUserProfile(id)
    } catch (e) {
        console.log(e);

        res.status(101)
        res.send(false)
    }

    res.status(200)
    res.send(profile)
});

app.get('/profile/:id', async (req, res) => {
    let id = req.params['id'];
    let profile;
    try {
        profile = await db.getUserProfile(id)
    } catch (e) {
        console.log(e);
        res.status(404).send({});
        return;
    }

    if (profile) {
        res.status(200).send(profile.toJson());
        return;
    }

    res.status(404).send({});
});


app.put("/api/profile/:id", async (req, res, next) => {
    try {
        const id = req.params['id']
        const data = req.body;

        await db.updateProfileByUserId({
            user_id: id,
            first_name: data.first_name,
            last_name: data.last_name,
            phone_number: data.phone_number,
            address: data.address,
            passport_serial: data.passport_serial,
        });

        res.status(200);
        res.send("Success");
    } catch (err) {
        res.status(500);
        res.send('An error occured while processing request');
        console.log(err);
    }
});

// app.get('/register/google', authenticate("google", {
//     scope: ['email', 'profile'],
//     successRedirect: process.env.CLIENT_HOME,
//     failureRedirect: process.env.CLIENT_REGISTER,
// }));

// app.get('/register/google/callback', authenticate("google", {
//     scope: ['email', 'profile'],
//     failureRedirect: process.env.CLIENT_LOGIN,
//     failureMessage: true,
//     successRedirect: process.env.CLIENT_HOME
// }), (req, res) => {
//     console.log("huh")
// });

// app.post('/login', authenticate('local', {
//     successRedirect: '/api',
//     failureRedirect: '/api'
// }), (err, req, res, next) => {
//     if (err) {
//         res.status(500);
//     }
//     res.status(200);
//     res.send("Success");
// });

// app.get('/login/status', async (req, res) => {
//     if (req.isAuthenticated()) {
//         let db = new DbAccessor();
//         res.json({ authenticated: true, user: await db.getUser(req.user._id) });
//     } else {
//         res.json({ authenticated: false });
//     }
// });

// app.post('/logout', (req, res, next) => {
//     req.logout(function (err) {
//         if (err) { return next(err); }
//         res.status(200);
//         res.send("Success");
//     });
// });

// app.get('/login-failure', (req, res, next) => {
//     console.log(req.session);
//     res.send('Login Attempt Failed.');
// });

// app.get('/login-success', (req, res, next) => {
//     console.log(req.session);
//     res.send('Login Attempt was successful.');
// });

// app.get('/profile', function (req, res) {
//     console.log(req.session)
//     if (req.isAuthenticated()) {
//         res.json({ message: 'You made it to the secured profie' })
//     } else {
//         res.json({ message: 'You are not authenticated' })
//     }
// })

// app.get("/api", (req, res) => {
//     res.json({ message: "Hello from server!", user: req.user });
// });

// // app.post("/api/init_database", async (req, res, next) => {
// //     if (!req.user) {
// //         res.status(401);
// //         res.send("Not authenticated");
// //         return;
// //     }
// //     try {
// //         let tmp = new BaseDbInit();
// //         //await tmp.initializeServiceTypes();
// //         //await tmp.initializeDeviceTypes();
// //         await tmp.initializeServices();
// //         res.status(200);
// //         res.send("Success");
// //     } catch (err) {
// //         res.status(500);
// //         res.send('An error occured while processing request');
// //         console.log(err);
// //         return;
// //     }
// // });

// // Service CRUD
// app.get("/api/service/:id", async (req, res) => {
//     try {
//         const dbAccess = new DbAccessor();
//         const service_id = req.params['id'];
//         const result = await dbAccess.getServiceById(service_id);

//         if (!result) {
//             res.status(404);
//             res.send(`No service with id ${service_id} found`)
//         }
//         else {
//             res.status(200);
//             res.send(result.toJSON());
//         }
//     } catch (err) {
//         res.status(500);
//         res.send('An error occured while processing request');
//         console.log(err);
//     }

// });

// app.post("/api/service", async (req, res, next) => {
//     if (!req.user) {
//         res.status(401);
//         res.send("Not authenticated");
//         return;
//     }
//     try {
//         const dbAccess = new DbAccessor();
//         const data = req.body;
//         console.log(data)
//         await dbAccess.addService({
//             service_type_id: data.service_type_id,
//             name: data.name,
//             description: data.description,
//             base_price: data.base_price,
//             device_types: data.device_types,
//         })
//         res.status(200);
//         res.send("Success");
//     } catch (err) {
//         res.status(500);
//         res.send('An error occured while processing request');
//         console.log(err);
//     }
// });

// app.put("/api/service/:id", async (req, res, next) => {
//     if (!req.user) {
//         res.status(401);
//         res.send("Not authenticated");
//         return;
//     }
//     try {
//         const dbAccess = new DbAccessor();
//         const service_id = req.params['id']
//         const data = req.body;

//         console.log(service_id);
//         console.log(data)

//         await dbAccess.updateServiceById({
//             service_id: service_id,
//             service_type_id: data.service_type_id,
//             name: data.name,
//             description: data.description,
//             base_price: data.base_price,
//             device_types: data.device_types,
//         })
//         res.status(200);
//         res.send("Success");
//     } catch (err) {
//         res.status(500);
//         res.send('An error occured while processing request');
//         console.log(err);
//     }
// });

// app.delete("/api/service/:id", async (req, res, next) => {
//     if (!req.user) {
//         res.status(401);
//         res.send("Not authenticated");
//         return;
//     }
//     try {
//         const dbAccess = new DbAccessor();
//         const service_id = req.params['id'];
//         await dbAccess.deleteServiceById(service_id);
//         res.status(200);
//         res.send({ message: `Service with id of ${service_id} deleted successfully` });
//     } catch (err) {

//     }

// });

// // Service search
// app.get("/api/service", async (req, res) => {
//     try {
//         const dbAccess = new DbAccessor();
//         const data = req.query;
//         console.log(data);
//         const result = await dbAccess.getServices({
//             service_type_id_list: data.service_type_list,
//             min_price: data.min_price,
//             max_price: data.max_price,
//             device_types: data.device_types,
//             text_query: data.text_query,
//             sort_by: data.sort,
//         });
//         res.status(200);
//         res.send(result);
//     } catch (err) {
//         res.status(500);
//         res.send('An error occured while processing request');
//         console.log(err);
//     }

// });

// // app.put("/api/profile/:id", async (req, res, next) => {
// //     if (!req.user && req.user._id !== req.params['id']) {
// //         res.status(401);
// //         res.send("Not authenticated");
// //         return;
// //     }
// //     try {
// //         const dbAccess = new DbAccessor();
// //         const id = req.params['id']
// //         const data = req.body;

// //         await dbAccess.updateUserProfileById({
// //             user_profile_id: id,
// //             first_name: data.first_name,
// //             last_name: data.last_name,
// //             phone_number: data.phone_number,
// //             address: data.address,
// //             passport_serial: data.passport_serial,
// //         });



// //         res.status(200);
// //         res.send("Success");
// //     } catch (err) {
// //         res.status(500);
// //         res.send('An error occured while processing request');
// //         console.log(err);
// //     }
// // });

const PORT = process.env.BACKEND_PORT;

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});