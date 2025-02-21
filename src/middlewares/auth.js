const jwt = require('jsonwebtoken');
const User = require('../models/userSchema');

const userAuth = async (req, res, next) => {

    try {
        const token = req.headers.token;
        if (!token) {
            return res.status(401).json({ error: "Unauthorized: No token provided" });
        }
        const decodedObj = await jwt.verify(token, process.env.JWT_SECRET);
        const { _id } = decodedObj;

        const user = await User.findById(_id);
        if (!user) {
            throw new Error("User not found");
        }
        
        req.user = user;
        next();
    }
    catch (err) {
        res.status(401).json({ error: err.message });
    }
}

module.exports = {
    userAuth,
}