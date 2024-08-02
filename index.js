const express = require("express");
const cors = require("cors");
const app = express();
const BodyParser = require("body-parser");
const jsonParser = BodyParser.json();

var jwt = require("jsonwebtoken");
var secret = "api_host";

const bcrypt = require("bcrypt");
const saltRounds = 10;

const port = 3306;
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

// app.get("/", (req, res) => 
//     res.json({status: "ok", message: " hello world"})
// );

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

  app.delete("/user/delete/:id", jsonParser, function (req, res) {
    const id = req.params.id;
    connection.execute(
      "DELETE FROM users WHERE id = ?",
      [id],
      (error, results) => {
        if (error) {
          console.error("Error deleting data:", error);
          res.json({ status: "error", message: "Failed to delete data" });
        } else {
          if (results.affectedRows > 0) {
            res.json({ status: "ok", message: "Deleted data successfully" });
          } else {
            res.json({ status: "error", message: "Data not found" });
          }
        }
      }
    );
  });

  app.post("/register", jsonParser, function (req, res, next) {
    const { fname, lname, username, password } = req.body;
    bcrypt.hash(password, saltRounds, function (err, hash) {
      connection.execute(
        "INSERT INTO users (fname, lname, username, password) VALUES (?, ?, ?, ?) ",
        [fname, lname, username, hash],
        function (err, results, fields) {
          if (err) {
            res.json({ status: "error", message: "register failed" });
          } else {
            res.json({ status: "ok", results: "register sucessed" });
          }
        }
      );
    });
  });
  
  app.post("/login", jsonParser, function (req, res, next) {
    const { username, password } = req.body;
  
    connection.execute(
      "SELECT * FROM users WHERE username = ? ",
      [username],
      function (err, user, fields) {
        if (err) {
          res.json({ status: "error", message: err });
          return;
        }
        if (user.length == 0) {
          res.json({ status: "error", message: "no user found" });
          return;
        }
        bcrypt.compare(password, user[0].password, function (err, Islogin) {
          if (Islogin) {
            var token = jwt.sign({ username: user[0].username}, secret);
            res.json({ status: "ok", results: "login successed", token });
          } else {
            res.json({ status: "error", message: "login failed" });
          }
        });
      }
    );
  });



  app.post('/authen', jsonParser, function (req, res, next) {
    const authen = req.headers.authorization;
    const token = authen.split(' ')[1];
  
    var decoded = jwt.verify(token, secret)
    res.json({status: "ok" ,  decoded})
  
  });

// app.get("/step", (req, res) =>
//   res.json({status: "ok", message: " Express on Vercel page 2"})
// );

// app.get("/step/inside", (req, res) =>
//     res.json({status: "ok", message: " Express on Vercel inside page 2"})
// );

app.listen(port, () => console.log(`Server ready on port ${port}`));

module.exports = app;
