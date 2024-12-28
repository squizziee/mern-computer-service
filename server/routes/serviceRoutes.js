import FirestoreAccessor from "../services/data/FirestoreAccessor.js";
import { Router } from "express";

const serviceRoutes = Router();
const db = new FirestoreAccessor();

serviceRoutes.get("/:id", async (req, res) => {
    try {
        const id = req.params['id'];
        const result = await db.getServiceById(id);

        if (!result) {
            res.status(404).send(`No service with id ${id} found`);
        }
        else {
            res.status(200).send(result);
        }
    } catch (err) {
        res.status(500).send('An error occured while processing request');
        console.log(err);
    }
});

serviceRoutes.post("/", async (req, res, next) => {
    try {
        const data = req.body;
        await db.addService({
            service_type_id: data.service_type_id,
            name: data.name,
            description: data.description,
            base_price: data.base_price,
            device_types: data.device_types,
        })
        res.status(200).send('Service type created');
    } catch (err) {
        res.status(500).send('An error occured while processing request: ' + err);
        console.log(err);
    }
});

serviceRoutes.put("/:id", async (req, res, next) => {
    try {
        const id = req.params['id']
        const data = req.body;

        await db.updateServiceById({
            service_id: id,
            service_type_id: data.service_type_id,
            name: data.name,
            description: data.description,
            base_price: data.base_price,
            device_types: data.device_types
        })
        res.status(200).send('Service type updated');
    } catch (err) {
        res.status(500).send('An error occured while processing request');
        console.log(err);
    }
});

serviceRoutes.delete("/:id", async (req, res, next) => {
    try {
        const id = req.params['id'];
        await db.deleteServiceById(id);
        res.status(200).send(`Service type with id of ${id} deleted successfully`);
    } catch (err) {
        res.status(500).send('An error occured while processing request');
        console.log(err);;
    }
});

serviceRoutes.get("/", async (req, res) => {
    try {
        const data = req.query;
        const result = await db.getServices({
            service_type_id_list: data.service_type_list,
            min_price: Number(data.min_price),
            max_price: Number(data.max_price),
            device_types: data.device_types,
            text_query: data.text_query,
            sort_by: data.sort,
        });
        res.status(200).send(result);
    } catch (err) {
        res.status(500).send('An error occured while processing request');;
        console.log(err);
    }
});

export default serviceRoutes;