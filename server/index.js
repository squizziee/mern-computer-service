import express, { urlencoded } from "express";
import dotenv from 'dotenv'
import authMiddleware from "./authMiddleware.js";
import FirestoreAccessor from "./services/data/FirestoreAccessor.js";
import cors from 'cors';

import deviceTypeRoutes from './routes/deviceTypeRoutes.js'
import serviceTypeRoutes from "./routes/serviceTypeRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

dotenv.config();

const app = express();

app.use(cors({
    origin: "http://localhost:5000", // allow to server to accept request from different origin
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true // allow session cookie from browser to pass through
}))

app.use(urlencoded({ extended: true }));

app.use("/api/", authMiddleware);

app.use('/api/devicetype', deviceTypeRoutes);
app.use('/api/servicetype', serviceTypeRoutes);
app.use('/api/service', serviceRoutes);
app.use('/api/order', orderRoutes);

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

const PORT = process.env.BACKEND_PORT;

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});