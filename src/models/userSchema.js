const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            maxLength: 100,
            trim: true
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            unique: true,
            trim: true,
            validate: {
                validator: validator.isEmail,
                message: "Not a valid Email address",
            },
        },
        password: {
            type: String,
            required: true,
            minLength: 8,
            maxLength: 128,
            validate: {
                validator: (value) =>
                    validator.isStrongPassword(value, {
                        minLength: 8,
                        minLowercase: 1,
                        minUppercase: 1,
                        minNumbers: 1,
                        minSymbols: 1,
                    }),
                message:
                    "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
            },
        },
        companyName: {
            type: String,
            required: true,
            trim: true,
        },
        dateOfBirth: {
            type: Date,
            required: true
        },
        age: {
            type: Number,
            required: true
        },
        photoUrl: {
            type: String,
            required: true
        },
        otp: { type: String, default: null },
        otpExpiry: { type: Date, default: null }
    },
    {
        timestamps: true,  
    }
);

userSchema.methods.getJWT = function () {
    const token = jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
        expiresIn: "1d",
    });

    return token;
}

userSchema.methods.validatePassword = async function (password) {
    const isPasswordValid = await bcrypt.compare(password, this.password);
    return isPasswordValid;
}

module.exports = mongoose.model("User", userSchema);