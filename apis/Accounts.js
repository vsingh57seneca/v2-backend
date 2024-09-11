const express = require("express");
const router = express.Router();
const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET = "keebgram-auth";

// Get All
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM accounts");
    res.json(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

//Get account by ID
router.get("/:token", async (req, res) => {
  try {
    const { token } = req.params;

    const decoded = jwt.verify(token, "keebgram-auth");

    const result = await pool.query("SELECT * FROM accounts WHERE id = $1", [
      decoded?.id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).send("Account not found");
    }

    const user = await pool.query(
      `SELECT * FROM accounts INNER JOIN account_details ON accounts.id = account_details.account_id WHERE accounts.id = $1`,
      [result.rows[0]?.id]
    );
    delete user.rows[0].password;
    console.log(user?.rows[0]);
    res.json(user.rows[0]);
  } catch (error) {
    console.error(error);
    if (error?.name === "TokenExpiredError") {
      res.status(403).send("Session expired. Please log in again.");
    } else {
      res.status(500).send(error.message);
    }
  }
});

//Create new account
router.post("/", async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      email,
      password,
      first_name,
      last_name,
      display_name,
      dob,
      country,
    } = req.body;

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    await client.query("BEGIN");

    const resultAccount = await client.query(
      `INSERT INTO accounts (email, password) VALUES ($1, $2) RETURNING id`,
      [email, hashedPassword]
    );

    const accountId = resultAccount.rows[0].id;

    const resultAccountDetails = await client.query(
      `INSERT INTO account_details (first_name, last_name, country, dob, display_name, account_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [first_name, last_name, country, dob, display_name, accountId]
    );

    const accountDetailsId = resultAccountDetails.rows[0].id;

    await client.query(
      `UPDATE accounts SET account_details = $1 WHERE id = $2`,
      [accountDetailsId, accountId]
    );

    await client.query("COMMIT");

    res.status(201).send("Account created successfully");
  } catch (error) {
    await client.query("ROLLBACK");
    if (error.code === "23505") {
      res.status(403).send("Account with email already exists");
      return;
    }
    res.status(500).send(error.message);
  } finally {
    client.release();
  }
});

//Update account details
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { token, is_verified } = req.body;
    const result = await pool.query(
      `UPDATE accounts set token = $1, is_verified = $2 WHERE id = $3 RETURNING *`,
      [token, is_verified, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).send("Account not found");
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `DELETE FROM accounts WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).send("Account not found");
    }
    res.send("Account deleted");
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
});

module.exports = router;
