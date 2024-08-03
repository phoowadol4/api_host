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

app.post("/add-user", jsonParser, function (req, res, next) {
  const { fname, lname, username, password } = req.body;
  connection.execute(
    'INSERT INTO users (fname, lname, username, password) VALUES (?, ?, ?, ?)',
    [fname, lname, username, password],
    function (err, results, fields) {
      if (err) {
        console.error('Error adding user:', err);  // Log the error
        res.json({ status: "error", message: "data not saved" });
      } else {
        res.json({ status: "ok", results: "data saved" });
      }
    }
  );
});

app.get("/users", jsonParser, function (req, res, next) {
  connection.execute(
    "SELECT * FROM users",
    function (err, results, fields) {
      if (err) {
        console.error('Error fetching users:', err);  // Log the error
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
        console.error('Error fetching user by ID:', err);  // Log the error
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
        console.error('Error deleting user:', error);  // Log the error
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
    if (err) {
      console.error('Error hashing password:', err);  // Log the error
      res.json({ status: "error", message: "register failed" });
      return;
    }
    connection.execute(
      "INSERT INTO users (fname, lname, username, password) VALUES (?, ?, ?, ?)",
      [fname, lname, username, hash],
      function (err, results, fields) {
        if (err) {
          console.error('Error registering user:', err);  // Log the error
          res.json({ status: "error", message: "register failed" });
        } else {
          res.json({ status: "ok", results: "register succeeded" });
        }
      }
    );
  });
});

app.post("/login", jsonParser, function (req, res, next) {
  const { username, password } = req.body;

  connection.execute(
    "SELECT * FROM users WHERE username = ?",
    [username],
    function (err, user, fields) {
      if (err) {
        console.error('Error finding user:', err);  // Log the error
        res.json({ status: "error", message: err });
        return;
      }
      if (user.length == 0) {
        res.json({ status: "error", message: "no user found" });
        return;
      }
      bcrypt.compare(password, user[0].password, function (err, isLogin) {
        if (err) {
          console.error('Error comparing passwords:', err);  // Log the error
          res.json({ status: "error", message: "login failed" });
          return;
        }
        if (isLogin) {
          var token = jwt.sign({ username: user[0].username }, secret);
          res.json({ status: "ok", results: "login succeeded", token });
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
  
  try {
    var decoded = jwt.verify(token, secret);
    res.json({ status: "ok", decoded });
  } catch (err) {
    console.error('Error verifying token:', err);  // Log the error
    res.json({ status: "error", message: "authentication failed" });
  }
});

app.listen(port, () => console.log(`Server ready on port ${port}`));

module.exports = app;
