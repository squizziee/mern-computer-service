import FirestoreAccessor from "../services/data/FirestoreAccessor.js";
import { Router } from "express";

const deviceTypeRoutes = Router();
const db = new FirestoreAccessor();

deviceTypeRoutes.get("/:id", async (req, res) => {
    try {
        const id = req.params['id'];
        const result = await db.getDeviceTypeById(id);

        if (!result) {
            res.status(404);
            res.send(`No device type with id ${id} found`)
        }
        else {
            res.status(200);
            res.send(result.toJson());
        }
    } catch (err) {
        res.status(500);
        res.send('An error occured while processing request');
        console.log(err);
    }

});

deviceTypeRoutes.post("/", async (req, res) => {
    console.log("Came");

    try {
        const data = req.body;
        await db.addDeviceType({
            name: data.name,
            description: data.description,
        })
        res.status(200);
        res.send('Device type created');
    } catch (err) {
        res.status(500);
        res.send('An error occured while processing request');
        console.log(err);
    }
});

deviceTypeRoutes.put("/:id", async (req, res) => {
    try {
        const id = req.params['id']
        const data = req.body;

        await db.updateDeviceTypeById({
            device_type_id: id,
            name: data.name,
            description: data.description,
        })
        res.status(200);
        res.send('Device type updated');
    } catch (err) {
        res.status(500);
        res.send('An error occured while processing request');
        console.log(err);
    }
});

deviceTypeRoutes.delete("/:id", async (req, res) => {
    try {
        const id = req.params['id'];
        await db.deleteDeviceTypeById(id);
        res.status(200);
        res.send({ message: `Device type with id of ${id} deleted successfully` });
    } catch (err) {
        res.status(500);
        res.send('An error occured while processing request');
        console.log(err);
    }
});

deviceTypeRoutes.get("/", async (req, res) => {
    try {
        const result = await db.getDeviceTypes();
        res.status(200);
        res.send(JSON.stringify(result));
    } catch (err) {
        res.status(500);
        res.send('An error occured while processing request');
        console.log(err);
    }

});

export default deviceTypeRoutes;