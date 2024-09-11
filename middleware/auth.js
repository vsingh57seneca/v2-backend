const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if(!token) {
        return res.status(401).json({message: "No token provided"});
    }

    jwt.verify(token, "keebgram-auth", (err, user) => {
        if(err) {
            return res.status(403).json({message: "Invalid or expired token. Please login again."});
        }

        req.user = user;
        next();
    });
}

module.exports = authenticateToken;