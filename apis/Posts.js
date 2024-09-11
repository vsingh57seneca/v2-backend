const express = require("express");
const router = express.Router();
const pool = require('../db');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authenticateToken = require("../middleware/auth");

const JWT_SECRET = "keebgram-auth";

module.exports = (io) => {
  router.get("/", async (req, res) => {
    try {
      const result = await pool.query("SELECT * FROM posts");
      res.json(result.rows);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server Error");
    }
  });

  router.post("/", authenticateToken, async (req, res) => {
    const client = await pool.connect();

    try {
      let post = req.body;
      console.log(post);
      const decode = jwt.verify(post?.owner, JWT_SECRET);
      post.owner = decode?.id;

      const result = await pool.query(
        "INSERT INTO posts (owner, title, content, image, keyboard, allowComments) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
        [post?.owner, post?.title, post?.content, post?.image, post?.keyboard, post?.allowComments]
      );

      const postId = result.rows[0].id;
      console.log(postId);

      if (postId) {
        // Emit an event to notify clients that a new post was created
        io.emit('new_post', { postId, post });

        res.status(201).send("Post created successfully");
      }
    } catch (error) {
      console.log(error);
      await client.query("ROLLBACK");
      if (error?.name === "TokenExpiredError") {
        res.status(403).send("Session expired. Please log in again.");
      } else {
        res.status(500).send(error.message);
      }
    } finally {
      client.release();
    }
  });

  return router;
};
