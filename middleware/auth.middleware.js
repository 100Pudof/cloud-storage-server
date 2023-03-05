const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = (req, res, next) => {
    if(req.method === "OPTIONS") {
        return next();
    }

    try {
        if(!req.headers.authorization) {
            return next();
        }
        const token = req.headers.authorization.split(" ")[1];
        if(!token) {
            return res.status(401).json({message: "Ошибка аутентификации."})
        }
        const decoded = jwt.verify(token, "anyone-secret");
        req.user = decoded;
        next();

    } catch (e) {
        console.log(e,'e error')
        return res.status(401).json({})
    }
}