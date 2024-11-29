const DbAccessor = require("../services/data/DbAccessor");

module.exports = function (app) {
    app.get("/api/order/:id", async (req, res) => {
        try {
            const dbAccess = new DbAccessor();
            const id = req.params['id'];
            const result = await dbAccess.getOrderById(id);

            if (!result) {
                res.status(404);
                res.send(`No order with id ${id} found`)
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

    app.post("/api/order", async (req, res, next) => {
        if (!req.user) {
            res.status(401);
            res.send("Not authenticated");
            return;
        }
        try {
            const dbAccess = new DbAccessor();
            const data = req.body;
            await dbAccess.addOrder({
                service: data.service,
                client: data.client,
                additional_info: data.additional_info
            })
            res.status(200);
            res.send('Order created');
        } catch (err) {
            res.status(500);
            res.send('An error occured while processing request');
            console.log(err);
        }
    });

    app.put("/api/order/cancel/:id", async (req, res, next) => {
        if (!req.user) {
            res.status(401);
            res.send("Not authenticated");
            return;
        }
        try {
            const dbAccess = new DbAccessor();
            const id = req.params['id'];
            await dbAccess.cancelOrderById(id);
            res.status(200);
            res.send('Order cancelled');
        } catch (err) {
            res.status(500);
            res.send('An error occured while processing request');
            console.log(err);
        }
    });

    app.put("/api/order/complete/:id", async (req, res, next) => {
        if (!req.user) {
            res.status(401);
            res.send("Not authenticated");
            return;
        }
        try {
            const dbAccess = new DbAccessor();
            const id = req.params['id'];
            await dbAccess.completeOrderById(id);
            res.status(200);
            res.send('Order completed');
        } catch (err) {
            res.status(500);
            res.send('An error occured while processing request');
            console.log(err);
        }
    });

    app.get("/api/order", async (req, res) => {
        try {
            const dbAccess = new DbAccessor();
            const result = await dbAccess.getOrders();
            res.status(200);
            res.send(result);
        } catch (err) {
            res.status(500);
            res.send('An error occured while processing request');
            console.log(err);
        }

    });

    app.get("/api/order/cancelled", async (req, res) => {
        try {
            const dbAccess = new DbAccessor();
            const result = await dbAccess.getCancelledOrders();
            res.status(200);
            res.send(result);
        } catch (err) {
            res.status(500);
            res.send('An error occured while processing request');
            console.log(err);
        }

    });

    app.get("/api/order/completed", async (req, res) => {
        try {
            const dbAccess = new DbAccessor();
            const result = await dbAccess.getCompletedOrders();
            res.status(200);
            res.send(result);
        } catch (err) {
            res.status(500);
            res.send('An error occured while processing request');
            console.log(err);
        }
    });
}