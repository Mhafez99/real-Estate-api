require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const PORT = process.env.PORT || 3500;
const connectDB = require("./config/dbConn");
const corsOptions = require("./config/corsOptions");
const cors = require("cors");
const path = require("path");
const httpStatusText = require("./utils/httpStatusText");
const cookieParser = require("cookie-parser");

connectDB();

app.use(cors(corsOptions));

app.use(express.json());

app.use(cookieParser());


app.use("/", express.static(path.join(__dirname, "public")));

app.use("/", require("./routes/root"));
app.use("/api/auth", require('./routes/authRoutes'));
app.use("/api/user", require('./routes/userRoutes'));
app.use("/api/listing", require('./routes/listingRoutes'));

// Global middleware for not found router
app.all("*", (req, res) => {
    res.status(404);
    if (req.accepts("html")) {
        res.sendFile(path.join(__dirname, "views", "404.html"));
    } else if (req.accepts('json')) {
        res.json({message: "404 Not Found"});
    } else {
        res.type('txt').send('404 Not Found');
    }
});

// global error handler
app.use((error, req, res, next) => {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    const statusText = error.statusText || httpStatusText.ERROR;
    return res.status(statusCode).json({
        success: false,
        message,
        code: statusCode,
        statusText
    });
});



mongoose.connection.once("open", () => {
    console.log("Connected To MongoDB");
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});

mongoose.connection.on("error", (err) => {
    console.log(err);
});