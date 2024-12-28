import FirestoreAccessor from "../services/data/FirestoreAccessor.js";
import { Router } from "express";

const orderRoutes = Router();
const db = new FirestoreAccessor();

orderRoutes.get("/:id", async (req, res) => {
    try {
        const id = req.params['id'];
        const result = await db.getOrderById(id);

        if (!result) {
            res.status(404).send(`No order with id ${id} found`);
        }
        else {
            res.status(200).send(result);
        }
    } catch (err) {
        res.status(500).send('An error occured while processing request');
        console.log(err);
    }
});

orderRoutes.post("/", async (req, res, next) => {
    try {
        const data = req.body;
        await db.addOrder({
            service_id: data.service,
            client_id: data.client,
            additional_info: data.additional_info
        })
        res.status(200).send('Order created');;
    } catch (err) {
        res.status(500).send('An error occured while processing request');;
        console.log(err);
    }
});

orderRoutes.put("/cancel/:id", async (req, res, next) => {
    try {
        const id = req.params['id'];
        await db.cancelOrderById(id);
        res.status(200).send('Order cancelled');
    } catch (err) {
        res.status(500).send('An error occured while processing request');;
        console.log(err);
    }
});

orderRoutes.put("/complete/:id", async (req, res, next) => {
    try {
        const id = req.params['id'];
        await db.completeOrderById(id);
        res.status(200).send('Order completed');
    } catch (err) {
        res.status(500).send('An error occured while processing request');
        console.log(err);
    }
});

orderRoutes.get("/", async (req, res) => {
    try {
        const result = await db.getOrders();
        res.status(200).send(result);

    } catch (err) {
        res.status(500).send('An error occured while processing request');
        console.log(err);
    }

});

orderRoutes.get("/pending", async (req, res) => {
    try {
        const result = await db.getPendingOrders();
        res.status(200).send(result);
    } catch (err) {
        res.status(500);
        res.send('An error occured while processing request');
        console.log(err);
    }

});

orderRoutes.get("/cancelled", async (req, res) => {
    try {
        const result = await db.getCancelledOrders();
        res.status(200).send(result);
    } catch (err) {
        res.status(500).send('An error occured while processing request');;
        console.log(err);
    }

});

orderRoutes.get("/completed", async (req, res) => {
    try {
        const result = await db.getCompletedOrders();
        res.status(200).send(result);
    } catch (err) {
        res.status(500).send('An error occured while processing request');
        console.log(err);
    }
});

export default orderRoutes;