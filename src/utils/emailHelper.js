const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, 
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

const sendOtpEmail = async (email, otp, retries = 3) => {
    const mailOptions = {
        from: `"NEW TECH" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Your OTP for Login",
        html: `
            <h1>Your One-Time Password (OTP)</h1>
            <p>Your OTP for login is: <strong>${otp}</strong></p>
            <p>This OTP will expire in 10 minutes. Do not share it with anyone.</p>
        `,
    };

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            await transporter.sendMail(mailOptions);
            return true;
        } catch (err) {
            console.error(`Attempt ${attempt}: Failed to send OTP email to ${email}:`, err.message);
            
            if (attempt === retries) {
                throw new Error("Failed to send OTP email after multiple attempts");
            }
        }
    }
};

module.exports = { sendOtpEmail };