import admin from "firebase-admin";

function authMiddleware(request, response, next) {
    const method = request.method
    next();
    return;
    if (method === "POST" || method === "GET" || method === "PUT" || method === "DELETE") {
        next();
        return;
    }

    const headerToken = request.headers.authorization;
    if (!headerToken) {
        return response.send({ message: "No token provided" }).status(401);
    }

    if (headerToken && headerToken.split(" ")[0] !== "Bearer") {
        response.send({ message: "Invalid token" }).status(401);
    }

    const token = headerToken.split(" ")[1];

    admin.auth()
        .verifyIdToken(token)
        .then(() => next())
        .catch((err) => console.log(err))
        .catch(() => response.send({ message: "Could not authorize" }).status(403));
}

export default authMiddleware;