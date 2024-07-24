const express = require("express");
const cors = require("cors");
const app = express();
const BodyParser = require("body-parser");
const jsonParser = BodyParser.json();

const mysql = require("mysql2");
app.use(cors());

const connection = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

app.get("/", (req, res) => res.send("hello welcome Express on Vercel"));

// app.get("/users", jsonParser, (req, res) => {
//   connection.execute("SELECT * FROM users", function (err, results, fields) {
//     res.json({"data": [results]})
//   });
// });

app.get("/users", jsonParser, function (req, res, next) {
    connection.execute(
      "SELECT * FROM users ",
      function (err, results, fields) {
        if (err) {
          res.json({ status: "error", message: err });
        } else {
          if (results.length > 0) {
            res.json({ status: "ok", results: results });
          } else {
            res.json({ status: "error", message: "data not found" });
          }
        }
      }
    );
  });

app.get("/step", (req, res) =>
  res.json("hello welcome Express on Vercel page 2")
);

app.get("/step/inside", (req, res) =>
  res.json("hello welcome Express on Vercel inside page 1")
);

// app.listen(port, () => console.log(`Server ready on port ${port}`));

module.exports = app;
