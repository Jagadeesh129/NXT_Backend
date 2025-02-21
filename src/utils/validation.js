const validator = require("validator");

const validateSignUpData = (req) => {
    let { name, email, password, companyName, dateOfBirth } = req.body;

    name = name?.trim() || "";
    email = email?.trim() || "";
    companyName = companyName?.trim() || "";

    let errors = [];

    if (name.length < 1) {
        errors.push("Name must be required");
    }

    if (!validator.isEmail(email)) {
        errors.push("Invalid email format");
    }

    if (!password || !validator.isStrongPassword(password)) {
        errors.push("Password must have at least 1 uppercase, 1 lowercase, 1 number, and 1 special character");
    }

    if (companyName.length < 1) {
        errors.push("Company Name is required");
    }

    if (!dateOfBirth || isNaN(new Date(dateOfBirth).getTime())) {
        errors.push("Valid date of birth is required");
    }

    if (!req.file) {
        errors.push("Profile Image is required (PNG or JPG)");
    }

    if (errors.length > 0) {
        return errors;
    }
    
    return null;
};

module.exports = { validateSignUpData };