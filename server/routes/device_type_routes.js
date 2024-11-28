const DbAccessor = require("../services/data/DbAccessor");

module.exports = function (app) {
    app.get("/api/devicetype/:id", async (req, res) => {
        try {
            const dbAccess = new DbAccessor();
            const id = req.params['id'];
            const result = await dbAccess.getDeviceTypeById(id);

            if (!result) {
                res.status(404);
                res.send(`No device type with id ${id} found`)
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

    app.post("/api/devicetype", async (req, res, next) => {
        if (!req.user) {
            res.status(401);
            res.send("Not authenticated");
            return;
        }
        try {
            const dbAccess = new DbAccessor();
            const data = req.body;
            await dbAccess.addDeviceType({
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

    app.put("/api/devicetype/:id", async (req, res, next) => {
        if (!req.user) {
            res.status(401);
            res.send("Not authenticated");
            return;
        }
        try {
            const dbAccess = new DbAccessor();
            const id = req.params['id']
            const data = req.body;

            await dbAccess.updateDeviceTypeById({
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

    app.delete("/api/devicetype/:id", async (req, res, next) => {
        if (!req.user) {
            res.status(401);
            res.send("Not authenticated");
            return;
        }
        try {
            const dbAccess = new DbAccessor();
            const id = req.params['id'];
            await dbAccess.deleteDeviceTypeById(id);
            res.status(200);
            res.send({ message: `Device type with id of ${id} deleted successfully` });
        } catch (err) {
            res.status(500);
            res.send('An error occured while processing request');
            console.log(err);;
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
}