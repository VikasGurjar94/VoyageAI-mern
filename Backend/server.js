// server.js

import express from "express";

const app = express();

// Middleware
app.use(express.json());

// Routes
app.get("/", function (req, res) {
    res.send("Hello World with ES Modules!");
});

app.get("/about", function (req, res) {
    res.send("About Page");
});

app.post("/data", function (req, res) {
    const data = req.body;

    res.json({
        message: "Data received",
        data: data
    });
});

// Server start
const PORT = 3000;

app.listen(PORT, function () {
    console.log(`Server running on port ${PORT}`);
});