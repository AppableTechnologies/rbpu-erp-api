const jwt = require("jsonwebtoken");


const authToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; //Expected: "Bearer <token>"
    if (!token) {
        return res.status(401).json({ message: 'Access token missing' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    })
}

module.exports = authToken;