import FirestoreAccessor from "../services/data/FirestoreAccessor.js";
import { Router } from "express";

const serviceTypeRoutes = Router();
const db = new FirestoreAccessor();

serviceTypeRoutes.get("/:id", async (req, res) => {
    try {
        const id = req.params['id'];
        const result = await db.getServiceTypeById(id);

        if (!result) {
            res.status(404);
            res.send(`No service type with id ${id} found`)
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

serviceTypeRoutes.post("/", async (req, res, next) => {
    try {
        const data = req.body;
        await db.addServiceType({
            name: data.name,
            description: data.description,
        })
        res.status(200);
        res.send('Service type created');
    } catch (err) {
        res.status(500);
        res.send('An error occured while processing request');
        console.log(err);
    }
});

serviceTypeRoutes.put("/:id", async (req, res, next) => {
    try {
        const id = req.params['id']
        const data = req.body;

        await db.updateServiceTypeById({
            service_type_id: id,
            name: data.name,
            description: data.description,
        })
        res.status(200);
        res.send('Service type updated');
    } catch (err) {
        res.status(500);
        res.send('An error occured while processing request');
        console.log(err);
    }
});

serviceTypeRoutes.delete("/:id", async (req, res, next) => {
    try {
        const id = req.params['id'];
        await db.deleteServiceTypeById(id);
        res.status(200);
        res.send({ message: `Service type with id of ${id} deleted successfully` });
    } catch (err) {
        res.status(500);
        res.send('An error occured while processing request');
        console.log(err);;
    }
});

serviceTypeRoutes.get("/", async (req, res) => {
    try {
        const result = await db.getServiceTypes();
        res.status(200);
        res.send(result);
    } catch (err) {
        res.status(500);
        res.send('An error occured while processing request');
        console.log(err);
    }
});

export default serviceTypeRoutes;