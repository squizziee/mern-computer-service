const DbAccessor = require("../services/data/DbAccessor");

module.exports = function (app) {
    app.get("/api/servicetype/:id", async (req, res) => {
        try {
            const dbAccess = new DbAccessor();
            const id = req.params['id'];
            const result = await dbAccess.getServiceTypeById(id);

            if (!result) {
                res.status(404);
                res.send(`No service with id ${id} found`)
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

    app.post("/api/servicetype", async (req, res, next) => {
        if (!req.user) {
            res.status(401);
            res.send("Not authenticated");
            return;
        }
        try {
            const dbAccess = new DbAccessor();
            const data = req.body;
            await dbAccess.addServiceType({
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

    app.put("/api/servicetype/:id", async (req, res, next) => {
        if (!req.user) {
            res.status(401);
            res.send("Not authenticated");
            return;
        }
        try {
            const dbAccess = new DbAccessor();
            const id = req.params['id']
            const data = req.body;

            await dbAccess.updateServiceTypeById({
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
        } finally {
            res.redirect("/api")
        }
    });

    app.delete("/api/servicetype/:id", async (req, res, next) => {
        if (!req.user) {
            res.status(401);
            res.send("Not authenticated");
            return;
        }
        try {
            const dbAccess = new DbAccessor();
            const id = req.params['id'];
            await dbAccess.deleteServiceTypeById(id);
            res.status(200);
            res.send({ message: `Service with id of ${id} deleted successfully` });
        } catch (err) {
            res.status(500);
            res.send('An error occured while processing request');
            console.log(err);;
        }
    });

    app.get("/api/servicetype", async (req, res) => {
        try {
            const dbAccess = new DbAccessor();
            const result = await dbAccess.getServiceTypes();
            res.status(200);
            res.send(result);
        } catch (err) {
            res.status(500);
            res.send('An error occured while processing request');
            console.log(err);
        }

    });
}