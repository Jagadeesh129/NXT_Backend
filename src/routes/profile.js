const express = require('express');
const User = require("../models/userSchema");
const { userAuth } = require("../middlewares/auth");
const { deleteFile } = require('../utils/fileHelper');

const profileRouter = express.Router();

profileRouter.get("/",userAuth, async (req,res) => {
    try{
        res.status(200).json({user: req.user});
    }
    catch(err) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
})

profileRouter.delete("/", userAuth, async (req, res) => {
    try {
        const userId = req.user._id;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized: User not found" });
        }
        if (req.user.photoUrl) {
            try {
                deleteFile(req.user.photoUrl);
            } catch (fileError) {
                console.error(`Failed to delete file: ${req.user.photoUrl}`, fileError.message);
            }
        }
        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(404).json({ error: "User not found" });
        }
        
        return res.json({ message: "User Deleted Successfully" });
    } catch (err) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = profileRouter;