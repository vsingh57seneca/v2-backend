const express = require("express");
const router = express.Router();
const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET = "keebgram-auth";


// Login user
router.post("/", async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query("SELECT * FROM accounts WHERE email = $1", [
      email,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).send("Account not found");
    }

    let passwordCompare = await bcrypt.compare(
      password,
      result.rows[0]?.password
    );

    if (passwordCompare === true) {
      delete result.rows[0]?.password;

      jwt.sign(
        result.rows[0],
        JWT_SECRET,
        { expiresIn: '1h'},
        (err, token) => {
            if (err) throw err;
            res.status(200).json({ token });
        }
      );
    } else {
      res.status(403).send("Invalid Email or Password");
      return;
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
});

module.exports = router;
