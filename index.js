const express = require("express");
const cors = require("cors"); // Import the cors package
const app = express();
const port = 3001;
const AccountsRouter = require('./apis/Accounts');
const AuthRouter = require('./apis/Auth');

// Configure CORS
const allowedOrigins = ['http://localhost:3002', 'https://victorsingh.ca', 'https://v2-frontend-victor.vercel.app', 'http://192.168.2.30:3001', 'http://localhost:3001'];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = `The CORS policy for this site does not allow access from the specified origin: ${origin}`;
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    optionsSuccessStatus: 200 // Some legacy browsers choke on a 204 status
}));

app.use(express.json());

// Import Routes
app.use('/accounts', AccountsRouter);
app.use('/auth', AuthRouter);


app.get("/", (req, res) => {
    res.json({message: "API running"});
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
