//dotenv
require('dotenv').config();

//express
const express = require('express');
const app = express();
app.use(express.json());

//Routes

app.get('/', (req, res) => {
    console.log('GET /', req.query);
    res.send('Hello World!')
})

app.use("/api", require("./routes/index"));


const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
