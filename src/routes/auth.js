const express = require("express");
const User = require("../models/userSchema");
const { validateSignUpData } = require('../utils/validation');
const bcrypt = require('bcrypt');
const { userAuth } = require("../middlewares/auth");
const multer = require("multer");
const { deleteFile } = require("../utils/fileHelper");
const otpGenerator = require("otp-generator");
const { sendOtpEmail} = require("../utils/emailHelper");

const authRouter = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = ["image/png", "image/jpg", "image/jpeg"];
        if (!allowed.includes(file.mimetype)) {
            return cb(new Error("Only PNG and JPG images are allowed"), false);
        }
        cb(null, true);
    },
});

authRouter.post("/signup", upload.single("photo"), async (req, res) => {
    const errors = validateSignUpData(req);
    const photoPath = req.file ? req.file.path : null;
    if (errors) {
        if(photoPath) deleteFile(photoPath);
        return res.status(400).json({ errors });
    }
    const { name, email, password, companyName, dateOfBirth } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            if(photoPath) deleteFile(photoPath);
            return res.status(400).json({ error: "User already exists with this email" });
        }

        const dob = new Date(dateOfBirth);
        const today = new Date();
        const age = today.getFullYear() - dob.getFullYear() - 
                    (today < new Date(today.getFullYear(), dob.getMonth(), dob.getDate()) ? 1 : 0);

        const passwordHash = await bcrypt.hash(password, 10);
        const user = new User({
            name,
            email,
            password: passwordHash,
            companyName,
            dateOfBirth: dob,
            age,
            photoUrl: photoPath
        });
        await user.save();
        res.status(201).json({ message: "User added successfully" });
    } catch (err) {
        if(photoPath) deleteFile(photoPath);
        res.status(500).json({ error: err.message });
    }
});

authRouter.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: "Invalid credentials" });
        }
        const isPasswordValid = await user.validatePassword(password);

        if (!isPasswordValid) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        const otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
            digits: true,
        });

        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

        user.otp = otp;
        user.otpExpiry = otpExpiry;
        await user.save();

        await sendOtpEmail(user.email, otp);

        res.setHeader("email", email);
        res.status(200).json({ message: "OTP sent to your email" });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});

authRouter.post("/verify-otp", async (req, res) => {
    const { otp } = req.body;
    const email = req.headers.email;

    if (!email) {
        return res.status(400).json({ error: "Missing email in headers" });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: "User not found" });
        }

        if (user.otp !== otp) {
            return res.status(400).json({ error: "Invalid OTP" });
        }
        if (user.otpExpiry < new Date()) {
            return res.status(400).json({ error: "OTP expired" });
        }

        const token = await user.getJWT();

        user.otp = null;
        user.otpExpiry = null;
        await user.save();
          
        res.status(200).json({ message: "Login Successful",token });
    } catch (err) {
        console.error("Error during OTP verification:", err.message);
        res.status(500).json({ error: "Server error: " + err.message });
    }
});

authRouter.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: err.message });
    } else if (err) {
        return res.status(400).json({ error: err.message });
    }
    next();
});

module.exports = authRouter;