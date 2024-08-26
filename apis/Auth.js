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
    console.log(req.body)
    const result = await pool.query("SELECT * FROM accounts WHERE email = $1", [email]);

    if (result.rows.length === 0) {
      return res.status(404).send("Account not found");
    }

    const passwordCompare = await bcrypt.compare(password, result.rows[0]?.password);

    if (passwordCompare) {
      delete result.rows[0]?.password;

      jwt.sign(
        { id: result.rows[0].id, email: result.rows[0].email }, // Only include necessary info
        JWT_SECRET,
        { expiresIn: '1h' },
        (err, token) => {
          if (err) throw err;
          res.status(200).json({ token });
        }
      );
    } else {
      res.status(403).send("Invalid Email or Password");
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
});

module.exports = router;
