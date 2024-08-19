const express = require("express");
const app = express();
const port = 3001;
const AccountsRouter = require('./apis/Accounts');

app.use(express.json());

// Import Routes
app.use('/accounts', AccountsRouter);

app.get("/", (req, res) => {
    res.json({message: "API running"});
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});