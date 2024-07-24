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

app.get("/", (req, res) => 
    res.json({status: "ok", message: " hello world"})
);

app.post("/add-user", jsonParser, function (req, res, next) {
    const {fname, lname, username, password} = req.body;
    connection.execute(
        'INSERT INTO users (fname, lname, username, password) VALUES (?, ?, ?, ?) ',
        [fname, lname, username, password],
        function (err, results, fields) {
            if (err ) {
                res.json({ status: "error", message: "data not saved" });
            }
            else {
                res.json({ status: "ok", results: "data saved" });

            }
        }
    )
})

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

  app.get("/users/:id", jsonParser, function (req, res, next) {
    const id = req.params.id;

    connection.execute(
      "SELECT * FROM users WHERE id = ?",
      [id],
      function (err, results, fields) {
        if (err) {
          res.json({ status: "error", message: err });
        } else {
          if (results.length > 0) {
            res.json({ status: "ok", results: results[0] });
          } else {
            res.json({ status: "error", message: "data not found" });
          }
        }
      }
    );
  });

app.get("/step", (req, res) =>
  res.json({status: "ok", message: " Express on Vercel page 2"})
);

app.get("/step/inside", (req, res) =>
    res.json({status: "ok", message: " Express on Vercel inside page 2"})
);

// app.listen(port, () => console.log(`Server ready on port ${port}`));

module.exports = app;
