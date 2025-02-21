const express = require("express");
const connectDB = require("./config/database");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");

app.use('/api/auth',authRouter);
app.use('/api/profile',profileRouter);

connectDB()
    .then(() => {
        app.listen(process.env.NODE_ENV, () => {
        });
    })
    .catch((err) => {
        console.error("Database cannot be conected");
        process.exit(1);
    });
