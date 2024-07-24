const express = require("express");
const cors = require("cors");
const app = express();

const port = 3000;

app.use(cors());

app.get("/", (req, res) => res.send("hello welcome Express on Vercel"));

app.get("/step", (req, res) => res.send("hello welcome Express on Vercel page 2"));

app.get("/step/inside", (req, res) => res.send("hello welcome Express on Vercel inside page 1"));

app.listen(port, () => console.log(`Server ready on port ${port}`));

module.exports = app;