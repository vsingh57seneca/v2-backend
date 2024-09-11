const express = require("express");
const cors = require("cors");
const app = express();
const port = 3001;
const AccountsRouter = require('./apis/Accounts');
const AuthRouter = require('./apis/Auth');
const PostsRouter = require('./apis/Posts');
const authenticateToken = require('./middleware/auth');
const http = require("http");
const { Server } = require("socket.io");

// Configure CORS
const allowedOrigins = ['http://localhost:3002', 'https://victorsingh.ca', 'https://v2-frontend-victor.vercel.app', 'http://192.168.2.30:3001', 'http://localhost:3001'];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = `The CORS policy for this site does not allow access from the specified origin: ${origin}`;
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    optionsSuccessStatus: 200
}));

app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
    pingInterval: 25000,
    pingTimeout: 60000,
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Set up Socket.IO connection
io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);

    socket.on('client_connected', (data) => {
        console.log(data?.message);
    });

    socket.on('disconnect', () => {
        console.log(`client disconnected: ${socket.id}`);
    });
});

// Pass the `io` instance to the routes
app.use('/accounts',  AccountsRouter);
app.use('/posts', PostsRouter(io)); // Pass io to PostsRouter
app.use('/auth', AuthRouter);

app.get("/", (req, res) => {
    res.json({ message: "API running" });
});

server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
