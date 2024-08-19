const { Pool } = require("pg");
require("dotenv").config();

const DEBUG = 0;

const pool = new Pool({
    user: process.env.DB_USER,
    host: DEBUG === 0 ? 'localhost' : process.env.DB_HOST ,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

module.exports = pool;